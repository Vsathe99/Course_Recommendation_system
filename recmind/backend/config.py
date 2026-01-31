from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration loaded from environment variables.
    """

    # ----------- Environment ----------- #
    ENV: str = Field(default="development", validation_alias="ENV")

    # ----------- External APIs ----------- #
    GITHUB_TOKEN: Optional[str] = Field(default=None)
    YOUTUBE_API_KEY: Optional[str] = Field(default=None)

    # ----------- Database ----------- #
    MONGO_URL: str = Field(..., min_length=10)
    DB_NAME: str = Field(..., min_length=1)

    # ----------- App Config ----------- #
    DATA_DIR: Path = Field(default=Path("/data/raw"))
    MAX_PER_SOURCE: int = Field(default=100, ge=1, le=10_000)
    
    RAW_DATA_DIR: Path = Field(default=Path("/data/raw"))
    FAISS_DIR: Path = Field(default=Path("/data/faiss"))
    MODEL_DIR: Path = Field(default=Path("/data/models"))

    # ----------- Pydantic Settings ----------- #
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",  # Ignore unknown env vars
    )


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance (singleton).
    Safe for production & dependency injection.
    """
    settings = Settings()

    # Ensure directories exist in production
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.FAISS_DIR.mkdir(parents=True, exist_ok=True)
    settings.MODEL_DIR.mkdir(parents=True, exist_ok=True)

    return settings
