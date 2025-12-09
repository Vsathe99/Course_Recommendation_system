from functools import lru_cache
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GITHUB_TOKEN: str | None = None
    YOUTUBE_API_KEY: str | None = None
    DATA_DIR: str = os.getenv("DATA_DIR", "./data/raw")
    MAX_PER_SOURCE: int = 100
    mongo_url: str
    db_name: str


    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()