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

