from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongo_uri: str | None = None
    mongo_db: str = "lore"
    default_repo_id: str = "demo"
    review_bonus: float = 0.15
    github_token: str | None = None
    github_min_interval_seconds: float = 0.35
    github_max_retries: int = 2
    github_rate_limit_wait_cap_seconds: int = 60

    model_config = SettingsConfigDict(env_prefix="LORE_", env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
