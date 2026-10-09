import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "Swasthya Copilot"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Your Health Records. Clearly Connected."
    API_V1_STR: str = "/api"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "swasthya_copilot_hackathon_secret_key_2026_secured")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'swasthya_copilot.db'}")
    
    # Storage
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS: set = {"pdf", "jpg", "jpeg", "png"}
    
    # AI / LLM Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # "auto", "ollama", "local_engine"
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
    LLM_REQUEST_TIMEOUT_SECONDS: int = 30
    
    # Multilingual
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: list[str] = ["en", "te", "hi", "ta"]
    
    # OCR Settings
    OCR_ENGINE: str = os.getenv("OCR_ENGINE", "auto")  # "auto", "tesseract", "builtin"
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
