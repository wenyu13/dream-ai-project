from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "筑梦AI支教"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 数据库配置
    MONGODB_URI: str = "mongodb://localhost:27017/dream-ai"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7天
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["http://localhost:5500", "http://127.0.0.1:5500"]
    
    # 文件上传配置
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".glb", ".gltf"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
