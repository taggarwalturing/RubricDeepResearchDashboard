"""
Data synchronization service to sync CTE results from BigQuery to PostgreSQL
Syncs only the derived review_detail data, not raw tables
"""
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import text, delete
from google.cloud import bigquery

from app.config import get_settings
from app.services.db_service import get_db_service
from app.models.db_models import ReviewDetail, Task, Contributor, DataSyncLog, TaskReviewedInfo

logger = logging.getLogger(__name__)


def calculate_week_number(task_date: datetime, project_start_date: str) -> Optional[int]:
    """
    Calculate week number from project start date
    Args:
        task_date: The task created/updated date
        project_start_date: Project start date string (YYYY-MM-DD)
    Returns:
        Week number (1-indexed) or None if dates are invalid
    """
    if not task_date or not project_start_date:
        return None
    
    try:
        start_date = datetime.strptime(project_start_date, "%Y-%m-%d")
        
        # Handle both datetime and date objects
        if hasattr(task_date, 'date'):
            task_dt = task_date
        else:
            task_dt = datetime.combine(task_date, datetime.min.time())
        
        # Calculate the difference in days
        days_diff = (task_dt - start_date).days
        
        # Week number is 1-indexed: (days_diff // 7) + 1
        # Weeks start from Monday (adjust if needed)
        week_num = (days_diff // 7) + 1
        
        return max(1, week_num)  # Ensure week number is at least 1
    except Exception as e:
        logger.warning(f"Error calculating week number: {e}")
        return None


class DataSyncService:
    """Service for syncing CTE results from BigQuery to PostgreSQL"""
    
    def __init__(self):
        self.settings = get_settings()
        self.db_service = get_db_service()
        self.bq_client = None
    
    def initialize_bigquery_client(self):
        """Initialize BigQuery client"""
        try:
            import os
            from google.oauth2 import service_account
            
            credentials_path = self.settings.google_application_credentials
            
            if credentials_path and os.path.exists(credentials_path):
                credentials = service_account.Credentials.from_service_account_file(
                    credentials_path
                )
                self.bq_client = bigquery.Client(
                    credentials=credentials,
                    project=self.settings.gcp_project_id
                )
            else:
                self.bq_client = bigquery.Client(
                    project=self.settings.gcp_project_id
                )
            
            logger.info("BigQuery client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing BigQuery client: {e}")
            raise
    
    def log_sync_start(self, table_name: str, sync_type: str = 'scheduled') -> int:
        """Log the start of a sync operation"""
        try:
            with self.db_service.get_session() as session:
                log_entry = DataSyncLog(
                    table_name=table_name,
                    sync_started_at=datetime.utcnow(),
                    sync_status='started',
                    sync_type=sync_type
                )
                session.add(log_entry)
                session.commit()
                return log_entry.id
        except Exception as e:
            logger.error(f"Error logging sync start: {e}")
            return 0
    
    def log_sync_complete(self, log_id: int, records_synced: int, success: bool = True, error_message: str = None):
        """Log the completion of a sync operation"""
        try:
            with self.db_service.get_session() as session:
                log_entry = session.query(DataSyncLog).filter(
                    DataSyncLog.id == log_id
                ).first()
                
                if log_entry:
                    log_entry.sync_completed_at = datetime.utcnow()
                    log_entry.records_synced = records_synced
                    log_entry.sync_status = 'completed' if success else 'failed'
                    log_entry.error_message = error_message
                    session.commit()
        except Exception as e:
            logger.error(f"Error logging sync complete: {e}")
    
    def _build_review_detail_query(self) -> str:
        """
        Build the complete review_detail CTE query
        This matches the query from bigquery_service.py
        """
        return f"""
            WITH task_reviewed_info AS ( 
                SELECT DISTINCT 
                    r.conversation_id AS r_id,
                    bt.task_id AS delivered_id,
                    c.colab_link AS RLHF_Link,
                    "False" AS is_delivered,
                    r.status,
                    r.score AS task_score,
                    DATE(r.updated_at) AS updated_at,
                    cb.name,
                    (
                        SELECT DATE(MIN(csh_inner.updated_at))
                        FROM `turing-gpt.prod_labeling_tool_z.conversation_status_history` csh_inner
                        WHERE csh_inner.conversation_id = c.id
                            AND csh_inner.old_status = 'labeling'
                            AND csh_inner.new_status = 'completed'
                    ) AS annotation_date
                FROM `turing-gpt.prod_labeling_tool_z.conversation` c
                INNER JOIN `turing-gpt.prod_labeling_tool_z.review` r
                    ON c.id = r.conversation_id
                INNER JOIN `turing-gpt.prod_labeling_tool_z.batch` b
                    ON c.project_id = b.project_id
                LEFT JOIN `turing-gpt.prod_labeling_tool_z.delivery_batch_task` bt
                    ON bt.task_id = c.id
                LEFT JOIN `turing-gpt.prod_labeling_tool_z.contributor` cb
                    ON cb.id = c.current_user_id
                WHERE c.project_id = {self.settings.project_id_filter}
                    AND c.status = 'completed'
                    AND r.review_type NOT IN ('auto')
                    AND r.followup_required = 0
                    AND r.id = (
                        SELECT MAX(rn.id)
                        FROM `turing-gpt.prod_labeling_tool_z.review` rn
                        WHERE rn.conversation_id = r.conversation_id
                            AND rn.review_type = 'manual'
                            AND rn.status = 'published'
                    )
            ),
            task AS (
                SELECT 
                    *,
                    CASE 
                        WHEN REGEXP_CONTAINS(statement, r'\\*\\*domain\\*\\*') THEN
                            TRIM(REGEXP_EXTRACT(statement, r'\\*\\*domain\\*\\*\\s*-\\s*([^\\n]+)'))
                        WHEN REGEXP_CONTAINS(statement, r'\\*\\*suggested-domain\\*\\*') THEN
                            TRIM(REGEXP_EXTRACT(statement, r'\\*\\*suggested-domain\\*\\*\\s*-\\s*([^\\n]+)'))
                        ELSE NULL
                    END AS domain
                FROM `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.conversation`
                WHERE project_id = {self.settings.project_id_filter} 
                    AND id IN (SELECT r_id FROM task_reviewed_info)
                    AND status = 'completed'
            ),
            review AS (
                SELECT 
                    *,
                    ROW_NUMBER() OVER(PARTITION BY conversation_id ORDER BY id DESC) AS row_num
                FROM `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.review`
                WHERE review_type = 'manual' 
                    AND status = 'published'
                    AND conversation_id IN (SELECT distinct id from task)
            ),
            review_detail AS (
                SELECT 
                    b.quality_dimension_id, 
                    task_.domain,
                    task_.human_role_id,
                    b.review_id, 
                    a.reviewer_id, 
                    a.conversation_id, 
                    tdi.is_delivered,
                    rqd.name, 
                    b.score_text, 
                    b.score,
                    a.score AS task_score,
                    tdi.updated_at
                FROM (SELECT * FROM review WHERE row_num = 1) a
                RIGHT JOIN task AS task_ 
                    ON task_.id = a.conversation_id
                LEFT JOIN task_reviewed_info AS tdi
                    ON tdi.r_id = task_.id
                LEFT JOIN `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.review_quality_dimension_value` AS b 
                    ON b.review_id = a.id
                LEFT JOIN `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.quality_dimension` AS rqd
                    ON rqd.id = b.quality_dimension_id
                WHERE 1=1
            )
            SELECT * FROM review_detail
        """
    
    def sync_review_detail(self, sync_type: str = 'scheduled') -> bool:
        """Sync review_detail CTE result from BigQuery"""
        log_id = self.log_sync_start('review_detail', sync_type)
        try:
            logger.info("Fetching review_detail data from BigQuery...")
            query = self._build_review_detail_query()
            
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            # Convert to list of dicts
            data = []
            for row in results:
                row_dict = dict(row)
                data.append(row_dict)
            
            logger.info(f"Fetched {len(data)} records from BigQuery")
            
            # Clear existing data and insert new data
            with self.db_service.get_session() as session:
                logger.info("Clearing existing review_detail data...")
                session.execute(delete(ReviewDetail))
                session.commit()
                
                # Insert new data in batches
                batch_size = 5000
                logger.info(f"Inserting data in batches of {batch_size}...")
                for i in range(0, len(data), batch_size):
                    batch = data[i:i + batch_size]
                    objects = [ReviewDetail(**record) for record in batch]
                    session.bulk_save_objects(objects)
                    session.commit()
                    logger.info(f"Synced {min(i + batch_size, len(data))}/{len(data)} review_detail records")
            
            self.log_sync_complete(log_id, len(data), True)
            logger.info(f"✓ Successfully synced {len(data)} review_detail records")
            return True
        except Exception as e:
            self.log_sync_complete(log_id, 0, False, str(e))
            logger.error(f"✗ Error syncing review_detail: {e}")
            return False
    
    def _build_task_query(self) -> str:
        """
        Build the task CTE query to extract tasks with domain, is_delivered, and rework_count
        """
        return f"""
            WITH task_reviewed_info AS ( 
                SELECT DISTINCT 
                    r.conversation_id AS r_id,
                    bt.task_id AS delivered_id,
                    c.colab_link AS RLHF_Link,
                    "False" AS is_delivered,
                    r.status,
                    r.score AS task_score,
                    DATE(r.updated_at) AS updated_at,
                    cb.name,
                    (
                        SELECT DATE(MIN(csh_inner.updated_at))
                        FROM `turing-gpt.prod_labeling_tool_z.conversation_status_history` csh_inner
                        WHERE csh_inner.conversation_id = c.id
                            AND csh_inner.old_status = 'labeling'
                            AND csh_inner.new_status = 'completed'
                    ) AS annotation_date
                FROM `turing-gpt.prod_labeling_tool_z.conversation` c
                INNER JOIN `turing-gpt.prod_labeling_tool_z.review` r
                    ON c.id = r.conversation_id
                INNER JOIN `turing-gpt.prod_labeling_tool_z.batch` b
                    ON c.project_id = b.project_id
                LEFT JOIN `turing-gpt.prod_labeling_tool_z.delivery_batch_task` bt
                    ON bt.task_id = c.id
                LEFT JOIN `turing-gpt.prod_labeling_tool_z.contributor` cb
                    ON cb.id = c.current_user_id
                WHERE c.project_id = {self.settings.project_id_filter}
                    AND c.status = 'completed'
                    AND r.review_type NOT IN ('auto')
                    AND r.followup_required = 0
                    AND r.id = (
                        SELECT MAX(rn.id)
                        FROM `turing-gpt.prod_labeling_tool_z.review` rn
                        WHERE rn.conversation_id = r.conversation_id
                            AND rn.review_type = 'manual'
                            AND rn.status = 'published'
                    )
            ),
            rework_counts AS (
                SELECT 
                    conversation_id,
                    COUNTIF(old_status = 'rework' OR new_status = 'rework') AS rework_count
                FROM `turing-gpt.prod_labeling_tool_z.conversation_status_history`
                WHERE conversation_id IN (SELECT r_id FROM task_reviewed_info)
                GROUP BY conversation_id
            ),
            task AS (
                SELECT 
                    c.id,
                    c.created_at,
                    c.updated_at,
                    c.statement,
                    c.status,
                    c.project_id,
                    c.batch_id,
                    c.current_user_id,
                    c.colab_link,
                    tdi.is_delivered,
                    COALESCE(rc.rework_count, 0) AS rework_count,
                    CASE 
                        WHEN REGEXP_CONTAINS(c.statement, r'\\*\\*domain\\*\\*') THEN
                            TRIM(REGEXP_EXTRACT(c.statement, r'\\*\\*domain\\*\\*\\s*-\\s*([^\\n]+)'))
                        WHEN REGEXP_CONTAINS(c.statement, r'\\*\\*suggested-domain\\*\\*') THEN
                            TRIM(REGEXP_EXTRACT(c.statement, r'\\*\\*suggested-domain\\*\\*\\s*-\\s*([^\\n]+)'))
                        ELSE NULL
                    END AS domain
                FROM `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.conversation` c
                INNER JOIN task_reviewed_info AS tdi
                    ON tdi.r_id = c.id
                LEFT JOIN rework_counts AS rc
                    ON rc.conversation_id = c.id
                WHERE c.project_id = {self.settings.project_id_filter} 
                    AND c.status = 'completed'
            )
            SELECT * FROM task
        """
    
    def sync_task(self, sync_type: str = 'scheduled') -> bool:
        """Sync task CTE result from BigQuery"""
        log_id = self.log_sync_start('task', sync_type)
        try:
            logger.info("Fetching task data from BigQuery...")
            query = self._build_task_query()
            
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            # Convert to list of dicts and calculate week_number
            data = []
            for row in results:
                row_dict = dict(row)
                
                # Calculate week_number based on updated_at (primary) or created_at (fallback)
                task_date = row_dict.get('updated_at') or row_dict.get('created_at')
                if task_date:
                    row_dict['week_number'] = calculate_week_number(
                        task_date, 
                        self.settings.project_start_date
                    )
                else:
                    row_dict['week_number'] = None
                
                data.append(row_dict)
            
            logger.info(f"Fetched {len(data)} task records from BigQuery")
            
            # Clear existing data and insert new data
            with self.db_service.get_session() as session:
                logger.info("Clearing existing task data...")
                session.execute(delete(Task))
                session.commit()
                
                # Insert new data in batches
                batch_size = 5000
                logger.info(f"Inserting data in batches of {batch_size}...")
                for i in range(0, len(data), batch_size):
                    batch = data[i:i + batch_size]
                    objects = [Task(**record) for record in batch]
                    session.bulk_save_objects(objects)
                    session.commit()
                    logger.info(f"Synced {min(i + batch_size, len(data))}/{len(data)} task records")
            
            self.log_sync_complete(log_id, len(data), True)
            logger.info(f"✓ Successfully synced {len(data)} task records")
            return True
        except Exception as e:
            self.log_sync_complete(log_id, 0, False, str(e))
            logger.error(f"✗ Error syncing task: {e}")
            return False
    
    def sync_contributor(self, sync_type: str = 'scheduled') -> bool:
        """Sync contributor names from BigQuery"""
        log_id = self.log_sync_start('contributor', sync_type)
        try:
            logger.info("Fetching contributor data from BigQuery...")
            
            # Fetch all contributors (including inactive ones referenced in reviews)
            query = f"""
                SELECT 
                    id,
                    name,
                    turing_email,
                    type,
                    status
                FROM `{self.settings.gcp_project_id}.{self.settings.bigquery_dataset}.contributor`
            """
            
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            # Convert to list of dicts
            data = []
            for row in results:
                row_dict = dict(row)
                data.append(row_dict)
            
            logger.info(f"Fetched {len(data)} contributor records from BigQuery")
            
            # Clear existing data and insert new data
            with self.db_service.get_session() as session:
                logger.info("Clearing existing contributor data...")
                session.execute(delete(Contributor))
                session.commit()
                
                # Insert new data
                objects = [Contributor(**record) for record in data]
                session.bulk_save_objects(objects)
                session.commit()
            
            self.log_sync_complete(log_id, len(data), True)
            logger.info(f"✓ Successfully synced {len(data)} contributor records")
            return True
        except Exception as e:
            self.log_sync_complete(log_id, 0, False, str(e))
            logger.error(f"✗ Error syncing contributor: {e}")
            return False
    
    def sync_task_reviewed_info(self, sync_type: str = 'scheduled') -> bool:
        """Sync task_reviewed_info CTE result from BigQuery"""
        log_id = self.log_sync_start('task_reviewed_info', sync_type)
        try:
            logger.info("Fetching task_reviewed_info data from BigQuery...")
            query = f"""
                WITH task_reviewed_info AS ( 
                    SELECT DISTINCT 
                        r.conversation_id AS r_id,
                        bt.task_id AS delivered_id,
                        c.colab_link AS RLHF_Link,
                        "False" AS is_delivered,
                        r.status,
                        r.score AS task_score,
                        DATE(r.updated_at) AS updated_at,
                        cb.name,
                        (
                            SELECT DATE(MIN(csh_inner.updated_at))
                            FROM `turing-gpt.prod_labeling_tool_z.conversation_status_history` csh_inner
                            WHERE csh_inner.conversation_id = c.id
                                AND csh_inner.old_status = 'labeling'
                                AND csh_inner.new_status = 'completed'
                        ) AS annotation_date
                    FROM `turing-gpt.prod_labeling_tool_z.conversation` c
                    INNER JOIN `turing-gpt.prod_labeling_tool_z.review` r
                        ON c.id = r.conversation_id
                    INNER JOIN `turing-gpt.prod_labeling_tool_z.batch` b
                        ON c.project_id = b.project_id
                    LEFT JOIN `turing-gpt.prod_labeling_tool_z.delivery_batch_task` bt
                        ON bt.task_id = c.id
                    LEFT JOIN `turing-gpt.prod_labeling_tool_z.contributor` cb
                        ON cb.id = c.current_user_id
                    WHERE c.project_id = {self.settings.project_id_filter}
                        AND c.status = 'completed'
                        AND r.review_type NOT IN ('auto')
                        AND r.followup_required = 0
                        AND r.id = (
                            SELECT MAX(rn.id)
                            FROM `turing-gpt.prod_labeling_tool_z.review` rn
                            WHERE rn.conversation_id = r.conversation_id
                                AND rn.review_type = 'manual'
                                AND rn.status = 'published'
                        )
                )
                SELECT * FROM task_reviewed_info
            """
            
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            # Convert to list of dicts and map column names
            data = []
            for row in results:
                row_dict = dict(row)
                # Map BigQuery column names to database column names
                mapped_row = {
                    'r_id': row_dict.get('r_id'),
                    'delivered_id': row_dict.get('delivered_id'),
                    'rlhf_link': row_dict.get('RLHF_Link'),  # Map RLHF_Link to rlhf_link
                    'is_delivered': row_dict.get('is_delivered'),
                    'status': row_dict.get('status'),
                    'task_score': row_dict.get('task_score'),
                    'updated_at': row_dict.get('updated_at'),
                    'name': row_dict.get('name'),
                    'annotation_date': row_dict.get('annotation_date')
                }
                data.append(mapped_row)
            
            logger.info(f"Fetched {len(data)} task_reviewed_info records from BigQuery")
            
            # Clear existing data and insert new data
            with self.db_service.get_session() as session:
                logger.info("Clearing existing task_reviewed_info data...")
                session.execute(delete(TaskReviewedInfo))
                session.commit()
                
                # Insert new data in batches
                batch_size = 5000
                logger.info(f"Inserting data in batches of {batch_size}...")
                for i in range(0, len(data), batch_size):
                    batch = data[i:i + batch_size]
                    objects = [TaskReviewedInfo(**record) for record in batch]
                    session.bulk_save_objects(objects)
                    session.commit()
                    logger.info(f"Synced {min(i + batch_size, len(data))}/{len(data)} task_reviewed_info records")
            
            self.log_sync_complete(log_id, len(data), True)
            logger.info(f"✓ Successfully synced {len(data)} task_reviewed_info records")
            return True
        except Exception as e:
            self.log_sync_complete(log_id, 0, False, str(e))
            logger.error(f"✗ Error syncing task_reviewed_info: {e}")
            return False
    
    def _update_is_delivered_status(self) -> None:
        """
        Update is_delivered status for all tasks based on work_item table.
        Tasks that exist in work_item table will have is_delivered = 'True',
        all others will have is_delivered = 'False'.
        Also syncs the status to ReviewDetail table.
        """
        try:
            logger.info("Updating is_delivered status based on work_item table...")
            
            with self.db_service.get_session() as session:
                from app.models.db_models import WorkItem, ReviewDetail
                from sqlalchemy import update
                
                # Get all unique task_ids from work_item table
                delivered_colab_link_ids = session.query(WorkItem.colab_link).distinct().all()
                delivered_colab_link_ids = [row[0] for row in delivered_colab_link_ids if row[0]]
                
                # Update Task table
                # First, set all tasks to is_delivered = 'False'
                session.execute(
                    update(Task).values(is_delivered='False')
                )
                
                # Then, set tasks that exist in work_item to is_delivered = 'True'
                delivered_task_ids = []
                if delivered_colab_link_ids:
                    session.execute(
                        update(Task).where(Task.colab_link.in_(delivered_colab_link_ids)).values(is_delivered='True')
                    )
                    
                    # Get the actual task IDs for delivered tasks
                    delivered_task_ids = session.query(Task.id).filter(
                        Task.colab_link.in_(delivered_colab_link_ids)
                    ).all()
                    delivered_task_ids = [row[0] for row in delivered_task_ids]
                
                # Update ReviewDetail table to match Task table
                # First, set all review_detail records to is_delivered = 'False'
                session.execute(
                    update(ReviewDetail).values(is_delivered='False')
                )
                
                # Then, set review_detail records for delivered tasks to is_delivered = 'True'
                if delivered_task_ids:
                    session.execute(
                        update(ReviewDetail).where(
                            ReviewDetail.conversation_id.in_(delivered_task_ids)
                        ).values(is_delivered='True')
                    )
                
                session.commit()
                logger.info(f"✓ Updated is_delivered status: {len(delivered_colab_link_ids)} colab_links ({len(delivered_task_ids)} tasks) marked as delivered")
                
        except Exception as e:
            logger.error(f"Error updating is_delivered status: {e}")
            raise
    
    def sync_all_tables(self, sync_type: str = 'scheduled') -> Dict[str, bool]:
        """Sync all required data from BigQuery to PostgreSQL"""
        logger.info(f"Starting data sync ({sync_type})...")
        logger.info("=" * 80)
        
        results = {}
        
        # Sync order: contributor first (for name lookups), then task_reviewed_info, then task, then review_detail
        sync_order = [
            ('contributor', self.sync_contributor),
            ('task_reviewed_info', self.sync_task_reviewed_info),
            ('task', self.sync_task),
            ('review_detail', self.sync_review_detail),
        ]
        
        for table_name, sync_func in sync_order:
            try:
                logger.info(f"Syncing: {table_name}")
                results[table_name] = sync_func(sync_type)
            except Exception as e:
                logger.error(f"Error syncing {table_name}: {e}")
                results[table_name] = False
        
        # Update is_delivered status after all syncs complete
        # This must happen AFTER review_detail sync to avoid being overwritten
        try:
            logger.info("Updating is_delivered status based on work_item table...")
            self._update_is_delivered_status()
        except Exception as e:
            logger.error(f"Error updating is_delivered status: {e}")
        
        success_count = sum(1 for v in results.values() if v)
        logger.info("=" * 80)
        logger.info(f"Data sync completed: {success_count}/{len(results)} tables synced successfully")
        
        return results


# Global data sync service instance
_data_sync_service = None


def get_data_sync_service() -> DataSyncService:
    """Get or create the global data sync service instance"""
    global _data_sync_service
    if _data_sync_service is None:
        _data_sync_service = DataSyncService()
    return _data_sync_service
