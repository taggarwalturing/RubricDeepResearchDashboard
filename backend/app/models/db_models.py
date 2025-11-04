"""
SQLAlchemy models for PostgreSQL database
Stores only the derived CTE results from _build_review_detail_query
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, 
    Text, BigInteger, Index
)
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class ReviewDetail(Base):
    """
    Materialized view of the review_detail CTE from BigQuery
    This is the core table used for all aggregations
    
    Contains the final result of all CTEs:
    - task_deliver_info
    - task
    - review
    - review_detail
    """
    __tablename__ = 'review_detail'
    
    # Primary key
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # Core fields from review_detail CTE
    quality_dimension_id = Column(Integer, nullable=True, index=True)
    domain = Column(String(500), nullable=True, index=True)
    human_role_id = Column(Integer, nullable=True, index=True)  # Trainer/Annotator ID
    review_id = Column(Integer, nullable=True, index=True)
    reviewer_id = Column(Integer, nullable=True, index=True)
    conversation_id = Column(Integer, nullable=True, index=True)  # Task ID
    is_delivered = Column(String(10), nullable=True, index=True)  # "True" or "False" string from BigQuery
    name = Column(String(500), nullable=True, index=True)  # Quality dimension name
    score_text = Column(String(200), nullable=True)
    score = Column(Float, nullable=True)
    task_score = Column(Float, nullable=True, index=True)  # Average score per task across all dimensions
    updated_at = Column(DateTime, nullable=True, index=True)  # Task update date from review
    
    # Additional indexes for performance
    __table_args__ = (
        Index('idx_domain_name', 'domain', 'name'),
        Index('idx_reviewer_name', 'reviewer_id', 'name'),
        Index('idx_trainer_name', 'human_role_id', 'name'),
        Index('idx_conversation_name', 'conversation_id', 'name'),
    )


class TaskReviewedInfo(Base):
    """
    Task reviewed info CTE result from BigQuery
    Contains review status and delivery information for tasks
    """
    __tablename__ = 'task_reviewed_info'
    
    # Primary key
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # Core fields from task_reviewed_info CTE
    r_id = Column(BigInteger, nullable=True, index=True)  # conversation_id from review
    delivered_id = Column(BigInteger, nullable=True, index=True)  # task_id from delivery_batch_task
    rlhf_link = Column(Text, nullable=True)  # colab_link
    is_delivered = Column(String(10), nullable=True, index=True)  # "True" or "False"
    status = Column(String(100), nullable=True)  # review status
    task_score = Column(Float, nullable=True)  # score from review
    updated_at = Column(DateTime, nullable=True, index=True)  # review updated_at
    name = Column(String(500), nullable=True)  # contributor name
    annotation_date = Column(DateTime, nullable=True)  # date when task moved from labeling to completed


class Task(Base):
    """
    Task CTE result from _build_review_detail_query
    Contains conversation/task data with extracted domain
    """
    __tablename__ = 'task'
    
    # From conversation table
    id = Column(BigInteger, primary_key=True, index=True)  # conversation.id
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    statement = Column(Text, nullable=True)
    status = Column(String(100), nullable=True, index=True)
    project_id = Column(Integer, nullable=True, index=True)
    batch_id = Column(Integer, nullable=True, index=True)
    current_user_id = Column(Integer, nullable=True, index=True)  # human_role_id/annotator
    colab_link = Column(Text, nullable=True)  # Collaboration link for the task
    week_number = Column(Integer, nullable=True, index=True)  # Week number from project start
    is_delivered = Column(String(10), nullable=True, index=True)  # "True" or "False" from task_deliver_info
    
    # Extracted domain (from CTE CASE statement)
    domain = Column(String(500), nullable=True, index=True)


class Contributor(Base):
    """
    Contributor/User lookup table
    Contains names for trainers and reviewers
    """
    __tablename__ = 'contributor'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(500), nullable=True, index=True)
    turing_email = Column(String(500), nullable=True)
    type = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)


class DataSyncLog(Base):
    """
    Data sync log table to track sync operations
    """
    __tablename__ = 'data_sync_log'
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    table_name = Column(String(200), nullable=False, index=True)
    sync_started_at = Column(DateTime, nullable=False)
    sync_completed_at = Column(DateTime, nullable=True)
    records_synced = Column(Integer, nullable=True)
    sync_status = Column(String(100), nullable=False)  # 'started', 'completed', 'failed'
    error_message = Column(Text, nullable=True)
    sync_type = Column(String(100), nullable=False)  # 'initial', 'scheduled', 'manual'


class WorkItem(Base):
    """
    Work items ingested from S3 JSON files
    Contains task information from Nova Deep Research evaluation rubrics
    """
    __tablename__ = 'work_item'
    
    # Primary key - changed to work_item_id
    work_item_id = Column(String(500), primary_key=True, nullable=False)
    
    # Core fields from JSON
    task_id = Column(String(500), nullable=False, index=True)
    annotator_id = Column(Integer, nullable=True, index=True)
    
    # Generated fields
    colab_link = Column(Text, nullable=True)  # https://rlhf-v3.turing.com/prompt/{taskId}
    
    # Metadata
    ingestion_date = Column(String(100), nullable=True, index=True)  # Folder name (YYYY-MM-DD)
    delivery_date = Column(DateTime, nullable=True, index=True)  # File upload date from S3
    json_filename = Column(String(500), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Status fields
    turing_status = Column(String(100), nullable=False, default='Delivered', index=True)  # Turing delivery status
    client_status = Column(String(100), nullable=False, default='Pending', index=True)  # Client feedback status (from Verdict)
    
    # Client feedback fields
    task_level_feedback = Column(Text, nullable=True)  # Task Level Feedback from client
    error_categories = Column(Text, nullable=True)  # Error Categories from client
    
    # Additional indexes
    __table_args__ = (
        Index('idx_workitem_task', 'work_item_id', 'task_id'),
        Index('idx_annotator_ingestion', 'annotator_id', 'ingestion_date'),
        Index('idx_delivery_date', 'delivery_date'),
        Index('idx_status', 'turing_status', 'client_status'),
    )
