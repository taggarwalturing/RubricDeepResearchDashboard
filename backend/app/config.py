"""
Configuration management for the application
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Settings
    app_name: str = "Amazon Delivery Dashboard API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # BigQuery Settings
    gcp_project_id: str = "turing-gpt"
    bigquery_dataset: str = "prod_labeling_tool_z"
    conversation_table: str = "conversation"
    review_table: str = "review"
    project_id_filter: int = 254
    
    # Google Cloud Credentials
    google_application_credentials: Optional[str] = None
    
    # API Settings
    api_prefix: str = "/api/v1"
    
    # CORS Settings
    cors_origins: list = ["*"]  # Update this with specific origins in production
    
    # Pagination
    default_page_size: int = 100
    max_page_size: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

