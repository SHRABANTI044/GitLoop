from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GitLoop"
    app_env: str = "development"
    debug: bool = False
    database_url: str = "sqlite:///./gitloop.db"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8001/api/auth/github/callback"
    github_app_id: str = ""
    github_app_slug: str = ""
    github_app_name: str = "GitLoop-AI-Dev"
    github_app_private_key: str = ""
    github_app_installation_redirect_uri: str = "http://localhost:8001/api/github/callback"
    github_token_encryption_key: str = ""
    frontend_url: str = "http://localhost:5173"

    ai_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    ai_request_timeout_seconds: int = 90

    allowed_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
