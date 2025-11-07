"""
Configuration management for the application
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Settings
    app_name: str = "Amazon Delivery Dashboard API"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000
    
    # BigQuery Settings
    gcp_project_id: str = "turing-gpt"
    bigquery_dataset: str = "prod_labeling_tool_z"
    conversation_table: str = "conversation"
    review_table: str = "review"
    project_id_filter: int = 254
    
    # Google Cloud Credentials
    google_application_credentials: Optional[str] = None
    
    # API Settings
    api_prefix: str = "/api"
    
    # CORS Settings
    cors_origins: list = ["*"]  # Update this with specific origins in production
    
    # Pagination
    default_page_size: int = 100
    max_page_size: int = 1000
    
    # PostgreSQL Settings
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "RubricDeepResearch"
    
    # Data Sync Settings
    sync_interval_hours: int = 1
    initial_sync_on_startup: bool = True
    
    # S3 Settings
    s3_bucket: str = "agi-ds-turing"
    s3_prefix: str = "Nova Deep Research - Turing Scale-Up/outputData/"
    s3_aws_profile: str = "amazon"  # AWS CLI profile name
    
    # AWS Credentials
    aws_region: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_role_arn: Optional[str] = None
    aws_s3_bucket_name: Optional[str] = None
    
    # Project Settings
    project_start_date: str = "2025-09-26"  # Format: YYYY-MM-DD
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # Ignore extra fields in .env that aren't in the model
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

