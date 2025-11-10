"""
Pydantic schemas for API request and response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, Any, List
from datetime import datetime


class QualityDimensionStats(BaseModel):
    """Schema for quality dimension statistics"""
    
    name: str = Field(..., description="Quality dimension name")
    average_score: Optional[float] = Field(None, description="Average score")
    task_count: int = Field(..., description="Number of tasks with this quality dimension")
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 2) if v is not None else None
        }


class DomainAggregation(BaseModel):
    """Schema for domain-based aggregation"""
    
    domain: Optional[str] = Field(None, description="Domain name")
    task_count: int = Field(..., description="Total unique tasks for this domain")
    average_task_score: Optional[float] = Field(None, description="Average task score across all tasks in this domain")
    total_rework_count: int = Field(0, description="Total rework count across all tasks in this domain")
    average_rework_count: float = Field(0.0, description="Average rework count per task in this domain")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class ReviewerAggregation(BaseModel):
    """Schema for reviewer-based aggregation"""
    
    reviewer_id: Optional[int] = Field(None, description="Reviewer ID")
    reviewer_name: Optional[str] = Field(None, description="Reviewer name")
    reviewer_email: Optional[str] = Field(None, description="Reviewer Turing email")
    task_count: int = Field(..., description="Total unique tasks for this reviewer")
    average_task_score: Optional[float] = Field(None, description="Average task score across all tasks by this reviewer")
    total_rework_count: int = Field(0, description="Total rework count across all tasks reviewed by this reviewer")
    average_rework_count: float = Field(0.0, description="Average rework count per task reviewed by this reviewer")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class TrainerLevelAggregation(BaseModel):
    """Schema for trainer level-based aggregation"""
    
    trainer_id: Optional[int] = Field(None, description="Trainer ID")
    trainer_name: Optional[str] = Field(None, description="Trainer name")
    trainer_email: Optional[str] = Field(None, description="Trainer Turing email")
    task_count: int = Field(..., description="Total unique tasks for this trainer")
    average_task_score: Optional[float] = Field(None, description="Average task score across all tasks by this trainer")
    total_rework_count: int = Field(0, description="Total rework count across all tasks by this trainer")
    average_rework_count: float = Field(0.0, description="Average rework count per task by this trainer")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class OverallAggregation(BaseModel):
    """Schema for overall aggregation"""
    
    task_count: int = Field(..., description="Total unique tasks overall")
    work_items_count: Optional[int] = Field(None, description="Total unique work items")
    reviewer_count: int = Field(0, description="Total unique reviewers")
    trainer_count: int = Field(0, description="Total unique trainers")
    domain_count: int = Field(0, description="Total unique domains")
    delivered_tasks: int = Field(0, description="Total delivered tasks from S3 work items")
    delivered_files: int = Field(0, description="Total distinct JSON files delivered")
    total_rework_count: int = Field(0, description="Total rework count across all tasks")
    average_rework_count: float = Field(0.0, description="Average rework count per task")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Overall statistics by quality dimension"
    )
    quality_dimensions_count: Optional[int] = Field(None, description="Total count of distinct quality dimensions")


class QualityDimensionDetail(BaseModel):
    """Schema for individual quality dimension detail"""
    
    name: str = Field(..., description="Quality dimension name")
    score_text: Optional[str] = Field(None, description="Score text (Pass/Not Pass)")
    score: Optional[float] = Field(None, description="Numeric score")


class TaskLevelInfo(BaseModel):
    """Schema for task-level information"""
    
    task_id: Optional[int] = Field(None, description="Task ID (conversation_id)")
    task_score: Optional[float] = Field(None, description="Average score for this task across all quality dimensions")
    annotator_id: Optional[int] = Field(None, description="Annotator ID (human_role_id)")
    annotator_name: Optional[str] = Field(None, description="Annotator name from contributor table")
    annotator_email: Optional[str] = Field(None, description="Annotator Turing email")
    reviewer_id: Optional[int] = Field(None, description="Reviewer ID")
    reviewer_name: Optional[str] = Field(None, description="Reviewer name from contributor table")
    reviewer_email: Optional[str] = Field(None, description="Reviewer Turing email")
    colab_link: Optional[str] = Field(None, description="Collaboration link for the task")
    updated_at: Optional[str] = Field(None, description="Task update date (ISO format)")
    week_number: Optional[int] = Field(None, description="Week number from project start date")
    rework_count: Optional[int] = Field(None, description="Number of times this task went to rework")
    quality_dimensions: dict = Field(
        default_factory=dict,
        description="Quality dimensions for this task as a dict {dimension_name: score}"
    )


class HealthResponse(BaseModel):
    """Schema for health check response"""
    
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Current timestamp")


class ErrorResponse(BaseModel):
    """Schema for error responses"""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")

