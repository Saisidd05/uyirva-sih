import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    # Core settings
    APP_NAME: str = "UYIRVA"
    # Some local shells set DEBUG=release. Keep this as text and expose a
    # normalized boolean for application settings.
    DEBUG: str = os.getenv("DEBUG", "true")
    # SQLite keeps local development self-contained. Override DATABASE_URL for
    # deployed PostgreSQL environments.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./uyirva.db")
    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "supersecretkeychangeme")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440
    # Demo mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    # Other
    ALLOWED_ORIGINS: list[str] = ["*"]

    @property
    def DEBUG_ENABLED(self) -> bool:
        return self.DEBUG.lower() in {"1", "true", "yes", "on", "debug"}

    model_config = SettingsConfigDict(env_file=Path(__file__).parent.parent.parent / ".env", env_file_encoding="utf-8")

settings = Settings()
