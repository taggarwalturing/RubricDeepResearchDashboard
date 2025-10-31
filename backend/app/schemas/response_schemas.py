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
    score_count: int = Field(..., description="Number of scores recorded")
    
    class Config:
        json_encoders = {
            float: lambda v: round(v, 2) if v is not None else None
        }


class DomainAggregation(BaseModel):
    """Schema for domain-based aggregation"""
    
    domain: Optional[str] = Field(None, description="Domain name")
    conversation_count: int = Field(..., description="Total unique conversations for this domain")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class ReviewerAggregation(BaseModel):
    """Schema for reviewer-based aggregation"""
    
    reviewer_id: Optional[int] = Field(None, description="Reviewer ID")
    reviewer_name: Optional[str] = Field(None, description="Reviewer name")
    conversation_count: int = Field(..., description="Total unique conversations for this reviewer")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class TrainerLevelAggregation(BaseModel):
    """Schema for trainer level-based aggregation"""
    
    trainer_level_id: Optional[int] = Field(None, description="Trainer level ID")
    trainer_name: Optional[str] = Field(None, description="Trainer name")
    conversation_count: int = Field(..., description="Total unique conversations for this trainer level")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Statistics by quality dimension"
    )


class OverallAggregation(BaseModel):
    """Schema for overall aggregation"""
    
    conversation_count: int = Field(..., description="Total unique conversations overall")
    reviewer_count: int = Field(0, description="Total unique reviewers")
    trainer_count: int = Field(0, description="Total unique trainers")
    quality_dimensions: List[QualityDimensionStats] = Field(
        default_factory=list,
        description="Overall statistics by quality dimension"
    )


class QualityDimensionDetail(BaseModel):
    """Schema for individual quality dimension detail"""
    
    name: str = Field(..., description="Quality dimension name")
    score_text: Optional[str] = Field(None, description="Score text (Pass/Not Pass)")
    score: Optional[float] = Field(None, description="Numeric score")


class TaskLevelInfo(BaseModel):
    """Schema for task-level information"""
    
    task_id: Optional[int] = Field(None, description="Task ID (conversation_id)")
    annotator_id: Optional[int] = Field(None, description="Annotator ID (human_role_id)")
    annotator_name: Optional[str] = Field(None, description="Annotator name from contributor table")
    reviewer_id: Optional[int] = Field(None, description="Reviewer ID")
    reviewer_name: Optional[str] = Field(None, description="Reviewer name from contributor table")
    quality_dimensions: List[QualityDimensionDetail] = Field(
        default_factory=list,
        description="Quality dimensions for this task"
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

