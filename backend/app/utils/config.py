from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # MongoDB Connection
    MONGODB_URL: str
    MONGODB_DB_NAME: str
    
    # Authentication
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # API Keys
    GOOGLE_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Google settings
    GOOGLE_GENAI_USE_VERTEXAI: bool = False
    
    # API prefix
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    CORS_ORIGINS: List[str]
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()