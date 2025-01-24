from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Doctor Stats"
    API_V1_STR: str = "/api/v1"

    # Database settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    SQLALCHEMY_DATABASE_URI: str = DATABASE_URL

    # JWT settings
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
