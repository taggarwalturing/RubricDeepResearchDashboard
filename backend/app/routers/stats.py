"""
API endpoints for aggregated statistics
"""
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Optional, Dict, Any
import logging

from app.schemas.response_schemas import (
    DomainAggregation,
    ReviewerAggregation,
    TrainerLevelAggregation,
    OverallAggregation,
    TaskLevelInfo
)
from app.services.postgres_query_service import get_postgres_query_service
from app.services.data_sync_service import get_data_sync_service
from app.services.s3_ingestion_service import get_s3_ingestion_service
from app.services.client_feedback_service import get_client_feedback_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Statistics"])


@router.get(
    "/by-domain",
    response_model=List[DomainAggregation],
    summary="Get statistics aggregated by domain",
    description="Retrieve aggregated statistics grouped by domain with quality dimension metrics"
)
async def get_stats_by_domain(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score"),
    min_task_count: Optional[int] = Query(None, ge=1, description="Minimum task count")
) -> List[DomainAggregation]:
    """
    Get statistics aggregated by domain
    
    Returns aggregated data for each domain including:
    - Count of unique conversations
    - Count of score texts
    - Average score
    
    All metrics are broken down by quality dimension (name).
    
    Returns:
    - List of domain aggregations with quality dimension statistics
    """
    try:
        pg_service = get_postgres_query_service()
        filters = {
            'domain': domain,
            'reviewer': reviewer,
            'trainer': trainer,
            'quality_dimension': quality_dimension,
            'min_score': min_score,
            'max_score': max_score,
            'min_task_count': min_task_count
        }
        result = pg_service.get_domain_aggregation(filters)
        
        return [DomainAggregation(**item) for item in result]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving domain statistics: {str(e)}"
        )


@router.get(
    "/by-reviewer",
    response_model=List[ReviewerAggregation],
    summary="Get statistics aggregated by reviewer",
    description="Retrieve aggregated statistics grouped by reviewer with quality dimension metrics"
)
async def get_stats_by_reviewer(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score"),
    min_task_count: Optional[int] = Query(None, ge=1, description="Minimum task count")
) -> List[ReviewerAggregation]:
    """
    Get statistics aggregated by reviewer
    
    Returns aggregated data for each reviewer including:
    - Count of unique conversations
    - Count of score texts
    - Average score
    
    All metrics are broken down by quality dimension (name).
    
    Returns:
    - List of reviewer aggregations with quality dimension statistics
    """
    try:
        pg_service = get_postgres_query_service()
        filters = {
            'domain': domain,
            'reviewer': reviewer,
            'trainer': trainer,
            'quality_dimension': quality_dimension,
            'min_score': min_score,
            'max_score': max_score,
            'min_task_count': min_task_count
        }
        result = pg_service.get_reviewer_aggregation(filters)
        
        return [ReviewerAggregation(**item) for item in result]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving reviewer statistics: {str(e)}"
        )


@router.get(
    "/by-trainer-level",
    response_model=List[TrainerLevelAggregation],
    summary="Get statistics aggregated by trainer level",
    description="Retrieve aggregated statistics grouped by trainer level with quality dimension metrics and trainer names"
)
async def get_stats_by_trainer_level(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score"),
    min_task_count: Optional[int] = Query(None, ge=1, description="Minimum task count")
) -> List[TrainerLevelAggregation]:
    """
    Get statistics aggregated by trainer level
    
    Returns aggregated data for each trainer level including:
    - Trainer level ID and name
    - Count of unique conversations
    - Pass/Not Pass breakdown
    - Average score
    
    All metrics are broken down by quality dimension (name).
    
    Returns:
    - List of trainer level aggregations with quality dimension statistics
    """
    try:
        pg_service = get_postgres_query_service()
        filters = {
            'domain': domain,
            'reviewer': reviewer,
            'trainer': trainer,
            'quality_dimension': quality_dimension,
            'min_score': min_score,
            'max_score': max_score,
            'min_task_count': min_task_count
        }
        result = pg_service.get_trainer_aggregation(filters)
        
        return [TrainerLevelAggregation(**item) for item in result]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving trainer level statistics: {str(e)}"
        )


@router.get(
    "/overall",
    response_model=OverallAggregation,
    summary="Get overall statistics",
    description="Retrieve overall aggregated statistics across all dimensions with quality dimension metrics"
)
async def get_overall_stats(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score"),
    min_task_count: Optional[int] = Query(None, ge=1, description="Minimum task count")
) -> OverallAggregation:
    """
    Get overall aggregated statistics
    
    Returns overall aggregated data including:
    - Count of unique conversations
    - Count of score texts
    - Average score
    
    All metrics are broken down by quality dimension (name).
    
    Returns:
    - Overall aggregation with quality dimension statistics
    """
    try:
        pg_service = get_postgres_query_service()
        filters = {
            'domain': domain,
            'reviewer': reviewer,
            'trainer': trainer,
            'quality_dimension': quality_dimension,
            'min_score': min_score,
            'max_score': max_score,
            'min_task_count': min_task_count
        }
        result = pg_service.get_overall_aggregation(filters)
        
        return OverallAggregation(**result)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving overall statistics: {str(e)}"
        )


@router.get(
    "/task-level",
    response_model=List[TaskLevelInfo],
    summary="Get task-level information",
    description="Retrieve task-level information with annotator details and quality dimensions"
)
async def get_task_level_info(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score"),
    min_task_count: Optional[int] = Query(None, ge=1, description="Minimum task count"),
    date_from: Optional[str] = Query(None, description="Filter by date from (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"),
    date_to: Optional[str] = Query(None, description="Filter by date to (ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
) -> List[TaskLevelInfo]:
    """
    Get task-level information
    
    Returns task-level data including:
    - Task ID (conversation_id)
    - Annotator ID (human_role_id)
    - Annotator name (from contributor table)
    - Reviewer ID and name
    - Updated date
    - Quality dimensions with scores
    
    Returns:
    - List of task-level information with annotator and quality dimension details
    """
    try:
        pg_service = get_postgres_query_service()
        filters = {
            'domain': domain,
            'reviewer': reviewer,
            'trainer': trainer,
            'quality_dimension': quality_dimension,
            'min_score': min_score,
            'max_score': max_score,
            'min_task_count': min_task_count,
            'date_from': date_from,
            'date_to': date_to
        }
        result = pg_service.get_task_level_data(filters)
        
        return [TaskLevelInfo(**item) for item in result]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving task-level information: {str(e)}"
        )


@router.post(
    "/sync",
    summary="Trigger data synchronization",
    description="Manually trigger data sync from BigQuery and S3 ingestion"
)
async def trigger_sync(
    sync_bigquery: bool = Query(True, description="Sync data from BigQuery"),
    sync_s3: bool = Query(True, description="Ingest data from S3")
) -> Dict[str, Any]:
    """
    Manually trigger data synchronization
    
    This endpoint allows you to:
    - Sync dashboard data from BigQuery (task, review_detail, contributor)
    - Ingest work items from S3 JSON files
    
    Returns:
    - Sync status and statistics for each operation
    """
    try:
        result = {
            "bigquery_sync": None,
            "s3_ingestion": None,
            "overall_status": "completed"
        }
        
        # Sync BigQuery data
        if sync_bigquery:
            logger.info("Manual sync triggered: BigQuery data")
            try:
                data_sync_service = get_data_sync_service()
                bigquery_result = data_sync_service.sync_all_tables(sync_type='manual')
                
                result["bigquery_sync"] = {
                    "status": "completed",
                    "tables_synced": {
                        "task": bigquery_result.get('task', False),
                        "review_detail": bigquery_result.get('review_detail', False),
                        "contributor": bigquery_result.get('contributor', False)
                    }
                }
                logger.info("✓ BigQuery sync completed")
            except Exception as e:
                logger.error(f"BigQuery sync failed: {e}")
                result["bigquery_sync"] = {
                    "status": "failed",
                    "error": str(e)
                }
                result["overall_status"] = "partial_failure"
        
        # Sync S3 data
        if sync_s3:
            logger.info("Manual sync triggered: S3 ingestion")
            try:
                s3_service = get_s3_ingestion_service()
                s3_result = s3_service.ingest_from_s3()
                
                result["s3_ingestion"] = {
                    "status": s3_result["status"],
                    "files_processed": s3_result["files_processed"],
                    "work_items_ingested": s3_result["work_items_ingested"],
                    "duration_seconds": s3_result["duration_seconds"],
                    "errors": s3_result.get("errors")
                }
                logger.info("✓ S3 ingestion completed")
            except Exception as e:
                logger.error(f"S3 ingestion failed: {e}")
                result["s3_ingestion"] = {
                    "status": "failed",
                    "error": str(e)
                }
                result["overall_status"] = "partial_failure"
        
        # Set overall status
        if result["bigquery_sync"] and result["bigquery_sync"]["status"] == "failed" and \
           result["s3_ingestion"] and result["s3_ingestion"]["status"] == "failed":
            result["overall_status"] = "failed"
        
        return result
    
    except Exception as e:
        logger.error(f"Sync operation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error during sync operation: {str(e)}"
        )


# ============================================================================
# CLIENT DELIVERY ENDPOINTS (Delivered Tasks Only)
# ============================================================================

@router.get(
    "/client-delivery/overall",
    response_model=OverallAggregation,
    summary="Get overall statistics for client delivery",
    description="Retrieve overall aggregated statistics for delivered tasks only"
)
async def get_client_delivery_overall_stats(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score")
) -> OverallAggregation:
    """Get overall statistics for client delivery (delivered tasks only)"""
    try:
        query_service = get_postgres_query_service()
        
        filters = {}
        if domain:
            filters['domain'] = domain
        if reviewer:
            filters['reviewer'] = reviewer
        if trainer:
            filters['trainer'] = trainer
        if quality_dimension:
            filters['quality_dimension'] = quality_dimension
        if min_score is not None:
            filters['min_score'] = min_score
        if max_score is not None:
            filters['max_score'] = max_score
        
        result = query_service.get_client_delivery_aggregation(filters if filters else None)
        return result
    except Exception as e:
        logger.error(f"Error retrieving client delivery overall statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery overall statistics: {str(e)}"
        )


@router.get(
    "/client-delivery/by-domain",
    response_model=List[DomainAggregation],
    summary="Get client delivery statistics by domain",
    description="Retrieve domain-wise statistics for delivered tasks only"
)
async def get_client_delivery_stats_by_domain(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score")
) -> List[DomainAggregation]:
    """Get domain-wise statistics for client delivery (delivered tasks only)"""
    try:
        query_service = get_postgres_query_service()
        
        filters = {}
        if domain:
            filters['domain'] = domain
        if reviewer:
            filters['reviewer'] = reviewer
        if trainer:
            filters['trainer'] = trainer
        if quality_dimension:
            filters['quality_dimension'] = quality_dimension
        if min_score is not None:
            filters['min_score'] = min_score
        if max_score is not None:
            filters['max_score'] = max_score
        
        result = query_service.get_client_delivery_domain_aggregation(filters if filters else None)
        return result
    except Exception as e:
        logger.error(f"Error retrieving client delivery domain statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery domain statistics: {str(e)}"
        )


@router.get(
    "/client-delivery/by-trainer",
    response_model=List[TrainerLevelAggregation],
    summary="Get client delivery statistics by trainer",
    description="Retrieve trainer-wise statistics for delivered tasks only"
)
async def get_client_delivery_stats_by_trainer(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score")
) -> List[TrainerLevelAggregation]:
    """Get trainer-wise statistics for client delivery (delivered tasks only)"""
    try:
        query_service = get_postgres_query_service()
        
        filters = {}
        if domain:
            filters['domain'] = domain
        if reviewer:
            filters['reviewer'] = reviewer
        if trainer:
            filters['trainer'] = trainer
        if quality_dimension:
            filters['quality_dimension'] = quality_dimension
        if min_score is not None:
            filters['min_score'] = min_score
        if max_score is not None:
            filters['max_score'] = max_score
        
        result = query_service.get_client_delivery_trainer_aggregation(filters if filters else None)
        return result
    except Exception as e:
        logger.error(f"Error retrieving client delivery trainer statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery trainer statistics: {str(e)}"
        )


@router.get(
    "/client-delivery/by-reviewer",
    response_model=List[ReviewerAggregation],
    summary="Get client delivery statistics by reviewer",
    description="Retrieve reviewer-wise statistics for delivered tasks only"
)
async def get_client_delivery_stats_by_reviewer(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    reviewer: Optional[str] = Query(None, description="Filter by reviewer ID"),
    trainer: Optional[str] = Query(None, description="Filter by trainer level ID"),
    quality_dimension: Optional[str] = Query(None, description="Filter by quality dimension name"),
    min_score: Optional[float] = Query(None, ge=0, le=5, description="Minimum score"),
    max_score: Optional[float] = Query(None, ge=0, le=5, description="Maximum score")
) -> List[ReviewerAggregation]:
    """Get reviewer-wise statistics for client delivery (delivered tasks only)"""
    try:
        query_service = get_postgres_query_service()
        
        filters = {}
        if domain:
            filters['domain'] = domain
        if reviewer:
            filters['reviewer'] = reviewer
        if trainer:
            filters['trainer'] = trainer
        if quality_dimension:
            filters['quality_dimension'] = quality_dimension
        if min_score is not None:
            filters['min_score'] = min_score
        if max_score is not None:
            filters['max_score'] = max_score
        
        result = query_service.get_client_delivery_reviewer_aggregation(filters if filters else None)
        return result
    except Exception as e:
        logger.error(f"Error retrieving client delivery reviewer statistics: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery reviewer statistics: {str(e)}"
        )


@router.get(
    "/client-delivery/tracker",
    response_model=List[Dict[str, Any]],
    summary="Get delivery tracker information",
    description="Retrieve delivery tracker with date, task count, and file names"
)
async def get_delivery_tracker() -> List[Dict[str, Any]]:
    """
    Get delivery tracker information
    
    Returns list of deliveries grouped by date with:
    - delivery_date: Date of delivery (YYYY-MM-DD)
    - total_tasks: Number of tasks delivered on that date
    - file_names: List of JSON file names
    - file_count: Count of distinct files
    """
    try:
        query_service = get_postgres_query_service()
        result = query_service.get_delivery_tracker()
        return result
    except Exception as e:
        logger.error(f"Error retrieving delivery tracker: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving delivery tracker: {str(e)}"
        )


@router.get(
    "/client-delivery/task-wise",
    response_model=List[Dict[str, Any]],
    summary="Get task-wise client delivery information",
    description="Retrieve task-level details for delivered work items"
)
async def get_client_delivery_task_wise() -> List[Dict[str, Any]]:
    """
    Get task-wise client delivery information
    
    Returns list of delivered tasks with:
    - work_item_id: Work item ID from S3
    - delivery_date: Date of delivery
    - task_id: Actual task ID (mapped via colab_link)
    - json_filename: Source JSON file name
    - task_score: Overall task score from review_detail
    """
    try:
        query_service = get_postgres_query_service()
        result = query_service.get_client_delivery_task_wise()
        return result
    except Exception as e:
        logger.error(f"Error retrieving client delivery task-wise data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery task-wise data: {str(e)}"
        )


@router.post(
    "/client-delivery/upload-feedback",
    response_model=Dict[str, Any],
    summary="Upload client feedback CSV/Excel",
    description="Upload client feedback file to update work item status with verdict"
)
async def upload_client_feedback(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload client feedback CSV/Excel file
    
    Expected columns:
    - Work Item Id (required)
    - Task Id (required)
    - Verdict (required)
    - taxonomy_label
    - Labelled Timestamp
    - isAuditDiscarded
    - prompt
    - Input_1
    - Pass_1
    - ManualAssessmentData
    - Task Level Feedback
    - Error Categories
    
    Updates work_item.client_status with Verdict value
    """
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        if not (file.filename.endswith('.csv') or 
                file.filename.endswith('.xlsx') or 
                file.filename.endswith('.xls')):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file format. Please upload CSV or Excel file."
            )
        
        # Read file content
        content = await file.read()
        
        # Process upload
        feedback_service = get_client_feedback_service()
        result = feedback_service.process_upload(content, file.filename)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['message'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading client feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing upload: {str(e)}"
        )


@router.get(
    "/client-delivery-summary",
    response_model=Dict[str, Any],
    summary="Get client delivery summary statistics",
    description="Get summary statistics from work_item table for client delivery overview"
)
async def get_client_delivery_summary() -> Dict[str, Any]:
    """
    Get client delivery summary statistics
    
    Returns:
    - Total tasks delivered
    - Total tasks rejected
    - Total files delivered
    - Average Turing rating
    """
    try:
        from app.services.db_service import get_db_service
        from app.models.db_models import WorkItem, Task, ReviewDetail
        from sqlalchemy import func, distinct
        
        db_service = get_db_service()
        
        with db_service.get_session() as session:
            # Total tasks delivered (distinct count of work_item_id)
            total_delivered = session.query(
                func.count(distinct(WorkItem.work_item_id))
            ).scalar() or 0
            
            # Total tasks accepted by client (client_status = 'Approved' or 'APPROVED')
            total_accepted = session.query(
                func.count(distinct(WorkItem.work_item_id))
            ).filter(
                func.upper(WorkItem.client_status).in_(['APPROVED', 'ACCEPTED'])
            ).scalar() or 0
            
            # Total tasks rejected by client (client_status = 'Rejected' or 'REJECTED')
            total_rejected = session.query(
                func.count(distinct(WorkItem.work_item_id))
            ).filter(
                func.upper(WorkItem.client_status) == 'REJECTED'
            ).scalar() or 0
            
            # Total tasks pending (not approved or rejected)
            total_pending = session.query(
                func.count(distinct(WorkItem.work_item_id))
            ).filter(
                func.upper(WorkItem.client_status).notin_(['APPROVED', 'ACCEPTED', 'REJECTED'])
            ).scalar() or 0
            
            # Total files delivered (distinct json_filename)
            total_files = session.query(
                func.count(distinct(WorkItem.json_filename))
            ).filter(
                WorkItem.json_filename.isnot(None)
            ).scalar() or 0
            
            # Average Turing rating (task_score from ReviewDetail for delivered tasks)
            # Join: work_item -> task (via colab_link) -> review_detail (via task.id = conversation_id)
            avg_rating_query = session.query(
                func.avg(ReviewDetail.task_score)
            ).select_from(WorkItem).join(
                Task, WorkItem.colab_link == Task.colab_link
            ).join(
                ReviewDetail, Task.id == ReviewDetail.conversation_id
            ).filter(
                ReviewDetail.task_score.isnot(None)
            )
            
            avg_rating = avg_rating_query.scalar()
            avg_rating = round(float(avg_rating), 2) if avg_rating else 0.0
            
            # Get distinct annotators count
            total_annotators = session.query(
                func.count(distinct(WorkItem.annotator_id))
            ).filter(
                WorkItem.annotator_id.isnot(None)
            ).scalar() or 0
            
            return {
                'total_tasks_delivered': total_delivered,
                'total_tasks_rejected': total_rejected,
                'total_tasks_accepted': total_accepted,
                'total_tasks_pending': total_pending,
                'total_files': total_files,
                'average_turing_rating': avg_rating,
                'total_annotators': total_annotators
            }
            
    except Exception as e:
        logger.error(f"Error getting client delivery summary: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving client delivery summary: {str(e)}"
        )


@router.get(
    "/client-delivery-timeline",
    response_model=List[Dict[str, Any]],
    summary="Get client delivery timeline data",
    description="Get date-wise breakdown of tasks by status (rejected, approved, pending)"
)
async def get_client_delivery_timeline() -> List[Dict[str, Any]]:
    """
    Get timeline data for client delivery
    
    Returns daily breakdown of:
    - Total tasks delivered
    - Tasks rejected
    - Tasks approved
    - Tasks pending
    """
    try:
        from app.services.db_service import get_db_service
        from app.models.db_models import WorkItem
        from sqlalchemy import func, cast, Date, distinct
        
        db_service = get_db_service()
        
        with db_service.get_session() as session:
            # Group by delivery date and status with average rating
            from sqlalchemy import case
            from app.models.db_models import Task, ReviewDetail
            
            # First, get the date-wise task scores for average rating
            rating_subquery = session.query(
                func.date(WorkItem.delivery_date).label('date'),
                func.avg(ReviewDetail.task_score).label('average_rating')
            ).outerjoin(
                Task, WorkItem.colab_link == Task.colab_link
            ).outerjoin(
                ReviewDetail, Task.id == ReviewDetail.conversation_id
            ).filter(
                WorkItem.delivery_date.isnot(None)
            ).group_by(
                func.date(WorkItem.delivery_date)
            ).subquery()
            
            # Now get distinct counts per status without the ReviewDetail join
            timeline_data = session.query(
                func.date(WorkItem.delivery_date).label('date'),
                func.count(distinct(WorkItem.work_item_id)).label('total'),
                func.count(distinct(
                    case(
                        (func.upper(WorkItem.client_status) == 'REJECTED', WorkItem.work_item_id),
                        else_=None
                    )
                )).label('rejected'),
                func.count(distinct(
                    case(
                        (func.upper(WorkItem.client_status).in_(['APPROVED', 'ACCEPTED']), WorkItem.work_item_id),
                        else_=None
                    )
                )).label('approved'),
                func.count(distinct(
                    case(
                        (func.upper(WorkItem.client_status).notin_(['APPROVED', 'ACCEPTED', 'REJECTED']), WorkItem.work_item_id),
                        else_=None
                    )
                )).label('pending'),
                rating_subquery.c.average_rating
            ).outerjoin(
                rating_subquery,
                func.date(WorkItem.delivery_date) == rating_subquery.c.date
            ).filter(
                WorkItem.delivery_date.isnot(None)
            ).group_by(
                func.date(WorkItem.delivery_date),
                rating_subquery.c.average_rating
            ).order_by(
                func.date(WorkItem.delivery_date)
            ).all()
            
            # Format results
            result = []
            for row in timeline_data:
                result.append({
                    'date': row.date.strftime('%Y-%m-%d') if row.date else None,
                    'total': int(row.total) if row.total else 0,
                    'rejected': int(row.rejected) if row.rejected else 0,
                    'approved': int(row.approved) if row.approved else 0,
                    'pending': int(row.pending) if row.pending else 0,
                    'average_rating': round(float(row.average_rating), 2) if row.average_rating else 0.0
                })
            
            return result
            
    except Exception as e:
        logger.error(f"Error getting client delivery timeline: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving timeline data: {str(e)}"
        )


@router.get(
    "/client-delivery-quality-timeline",
    response_model=List[Dict[str, Any]],
    summary="Get quality dimension scores timeline",
    description="Get average quality dimension scores by delivery date"
)
async def get_client_delivery_quality_timeline() -> List[Dict[str, Any]]:
    """
    Get average quality dimension scores grouped by delivery date
    
    Returns a list of dates with average scores for each quality dimension
    """
    try:
        from sqlalchemy import func, cast, Date, distinct
        from app.services.db_service import get_db_service
        from app.models.db_models import Task, ReviewDetail, WorkItem
        
        db_service = get_db_service()
        
        with db_service.get_session() as session:
            
            # Get quality dimension scores grouped by date and dimension
            quality_timeline = session.query(
                func.date(WorkItem.delivery_date).label('date'),
                ReviewDetail.name.label('dimension'),
                func.avg(ReviewDetail.score).label('average_score')
            ).join(
                Task, WorkItem.colab_link == Task.colab_link
            ).join(
                ReviewDetail, Task.id == ReviewDetail.conversation_id
            ).filter(
                WorkItem.delivery_date.isnot(None),
                ReviewDetail.name.isnot(None),
                ReviewDetail.score.isnot(None)
            ).group_by(
                func.date(WorkItem.delivery_date),
                ReviewDetail.name
            ).order_by(
                func.date(WorkItem.delivery_date)
            ).all()
            
            # Transform data: group by date, then have each dimension as a key
            date_map = {}
            for row in quality_timeline:
                date_str = row.date.strftime('%Y-%m-%d') if row.date else None
                if date_str not in date_map:
                    date_map[date_str] = {'date': date_str}
                
                dimension = row.dimension if row.dimension else 'unknown'
                date_map[date_str][dimension] = round(float(row.average_score), 2) if row.average_score else 0.0
            
            # Convert to list sorted by date
            result = [date_map[date] for date in sorted(date_map.keys())]
            
            return result
            
    except Exception as e:
        logger.error(f"Error getting quality timeline: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving quality timeline data: {str(e)}"
        )


@router.get(
    "/client-delivery-sankey",
    response_model=Dict[str, Any],
    summary="Get Sankey diagram data for client delivery",
    description="Get domain to status flow data for Sankey visualization"
)
async def get_client_delivery_sankey() -> Dict[str, Any]:
    """
    Get Sankey diagram data showing flow from domains to delivery status
    
    Returns nodes and links for Sankey visualization
    """
    try:
        from sqlalchemy import func
        from app.services.db_service import get_db_service
        from app.models.db_models import Task, WorkItem
        
        db_service = get_db_service()
        
        with db_service.get_session() as session:
            # Get date -> domain -> status distribution
            date_domain_status = session.query(
                func.date(WorkItem.delivery_date).label('date'),
                Task.domain.label('domain'),
                WorkItem.client_status.label('status'),
                func.count(func.distinct(WorkItem.work_item_id)).label('count')
            ).join(
                WorkItem, Task.colab_link == WorkItem.colab_link
            ).filter(
                Task.domain.isnot(None),
                WorkItem.client_status.isnot(None),
                WorkItem.delivery_date.isnot(None)
            ).group_by(
                func.date(WorkItem.delivery_date),
                Task.domain,
                WorkItem.client_status
            ).all()
            
            # Build nodes and links for 3-level Sankey
            nodes = []
            links = []
            
            # Collect unique dates, domains, and statuses
            dates = set()
            domains = set()
            statuses = set()
            
            # Track date->domain and domain->status connections
            date_domain_map = {}
            domain_status_map = {}
            
            for row in date_domain_status:
                date_str = row.date.strftime('%Y-%m-%d') if row.date else None
                domain = row.domain
                status = row.status.upper() if row.status else 'UNKNOWN'
                if status in ['APPROVED', 'ACCEPTED']:
                    status = 'APPROVED'
                elif status == 'REJECTED':
                    status = 'REJECTED'
                else:
                    status = 'PENDING'
                
                count = int(row.count) if row.count else 0
                
                if date_str and count > 0:
                    dates.add(date_str)
                    domains.add(domain)
                    statuses.add(status)
                    
                    # Track date -> domain
                    date_domain_key = f"{date_str}|{domain}"
                    if date_domain_key not in date_domain_map:
                        date_domain_map[date_domain_key] = 0
                    date_domain_map[date_domain_key] += count
                    
                    # Track domain -> status (per date to avoid conflicts)
                    domain_status_key = f"{date_str}|{domain}|{status}"
                    if domain_status_key not in domain_status_map:
                        domain_status_map[domain_status_key] = 0
                    domain_status_map[domain_status_key] += count
            
            # Collect unique node IDs from the maps
            date_nodes = set()
            domain_nodes = set()
            
            for key in date_domain_map.keys():
                date_str, domain = key.split('|')
                date_nodes.add(date_str)
                domain_nodes.add(f"{date_str}|{domain}")
            
            # Create nodes - Level 1: Dates (Purple)
            for date in sorted(date_nodes):
                nodes.append({
                    "id": f"date_{date}",
                    "nodeColor": "hsl(270, 70%, 50%)"
                })
            
            # Create nodes - Level 2: Domains (Blue)
            for node_id in sorted(domain_nodes):
                date_str, domain = node_id.split('|')
                nodes.append({
                    "id": f"domain_{date_str}_{domain}",
                    "nodeColor": "hsl(210, 70%, 50%)"
                })
            
            # Create nodes - Level 3: Status (Green/Red/Amber)
            for status in ['APPROVED', 'REJECTED', 'PENDING']:
                if status in statuses:
                    color = "hsl(142, 70%, 50%)" if status == 'APPROVED' else \
                            "hsl(0, 70%, 50%)" if status == 'REJECTED' else \
                            "hsl(45, 70%, 50%)"
                    nodes.append({
                        "id": status,
                        "nodeColor": color
                    })
            
            # Create links - Date to Domain
            for key, value in date_domain_map.items():
                date_str, domain = key.split('|')
                links.append({
                    "source": f"date_{date_str}",
                    "target": f"domain_{date_str}_{domain}",
                    "value": value
                })
            
            # Create links - Domain to Status
            for key, value in domain_status_map.items():
                date_str, domain, status = key.split('|')
                links.append({
                    "source": f"domain_{date_str}_{domain}",
                    "target": status,
                    "value": value
                })
            
            return {
                "nodes": nodes,
                "links": links
            }
            
    except Exception as e:
        logger.error(f"Error getting Sankey data: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving Sankey data: {str(e)}"
        )


@router.get(
    "/sync-info",
    response_model=Dict[str, Any],
    summary="Get data sync information",
    description="Get current UTC time and last BigQuery sync information"
)
async def get_sync_info() -> Dict[str, Any]:
    """
    Get data synchronization information
    
    Returns:
    - Current UTC time
    - Last sync time from BigQuery
    - Sync status
    """
    try:
        from datetime import datetime, timezone
        from app.services.db_service import get_db_service
        from app.models.db_models import DataSyncLog
        from sqlalchemy import desc
        
        db_service = get_db_service()
        
        with db_service.get_session() as session:
            # Get the most recent completed sync
            last_sync = session.query(DataSyncLog).filter(
                DataSyncLog.sync_status == 'completed'
            ).order_by(
                desc(DataSyncLog.sync_completed_at)
            ).first()
            
            current_utc = datetime.now(timezone.utc)
            
            sync_info = {
                'current_utc_time': current_utc.isoformat(),
                'last_sync_time': last_sync.sync_completed_at.isoformat() if last_sync and last_sync.sync_completed_at else None,
                'last_sync_type': last_sync.sync_type if last_sync else None,
                'tables_synced': []
            }
            
            # Get all tables from the last sync batch
            if last_sync:
                recent_syncs = session.query(DataSyncLog).filter(
                    DataSyncLog.sync_completed_at == last_sync.sync_completed_at,
                    DataSyncLog.sync_status == 'completed'
                ).all()
                
                sync_info['tables_synced'] = [
                    {
                        'table_name': sync.table_name,
                        'records_synced': sync.records_synced,
                        'sync_started_at': sync.sync_started_at.isoformat() if sync.sync_started_at else None
                    }
                    for sync in recent_syncs
                ]
            
            return sync_info
            
    except Exception as e:
        logger.error(f"Error getting sync info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving sync information: {str(e)}"
        )

