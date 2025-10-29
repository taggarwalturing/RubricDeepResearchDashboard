"""
API endpoints for aggregated statistics
"""
from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.response_schemas import (
    DomainAggregation,
    ReviewerAggregation,
    TrainerLevelAggregation,
    OverallAggregation,
    TaskLevelInfo
)
from app.services.bigquery_service import get_bigquery_service

router = APIRouter(tags=["Statistics"])


@router.get(
    "/by-domain",
    response_model=List[DomainAggregation],
    summary="Get statistics aggregated by domain",
    description="Retrieve aggregated statistics grouped by domain with quality dimension metrics"
)
async def get_stats_by_domain() -> List[DomainAggregation]:
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
        bq_service = get_bigquery_service()
        result = await bq_service.get_domain_aggregation()
        
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
async def get_stats_by_reviewer() -> List[ReviewerAggregation]:
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
        bq_service = get_bigquery_service()
        result = await bq_service.get_reviewer_aggregation()
        
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
async def get_stats_by_trainer_level() -> List[TrainerLevelAggregation]:
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
        bq_service = get_bigquery_service()
        result = await bq_service.get_trainer_level_aggregation()
        
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
async def get_overall_stats() -> OverallAggregation:
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
        bq_service = get_bigquery_service()
        result = await bq_service.get_overall_aggregation()
        
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
async def get_task_level_info() -> List[TaskLevelInfo]:
    """
    Get task-level information
    
    Returns task-level data including:
    - Task ID (conversation_id)
    - Annotator ID (human_role_id)
    - Annotator name (from contributor table)
    - Quality dimensions with scores
    
    Returns:
    - List of task-level information with annotator and quality dimension details
    """
    try:
        bq_service = get_bigquery_service()
        result = await bq_service.get_task_level_info()
        
        return [TaskLevelInfo(**item) for item in result]
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving task-level information: {str(e)}"
        )

