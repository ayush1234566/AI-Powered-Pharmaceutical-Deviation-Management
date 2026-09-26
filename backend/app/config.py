"""
AIVOA Backend - Configuration Module
Loads environment variables and provides app-wide settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Groq AI Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./aivoa_deviations.db"
    )

    # App
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: set = {
        ".pdf", ".docx", ".doc", ".txt", ".xls", ".xlsx",
        ".jpg", ".jpeg", ".png"
    }

    @classmethod
    def validate(cls):
        """Validate critical settings on startup."""
        if not cls.GROQ_API_KEY or cls.GROQ_API_KEY == "your_groq_api_key_here":
            print("[WARNING] GROQ_API_KEY is not set. AI features will not work.")
            print("          Get your key from https://console.groq.com")
            return False
        return True


settings = Settings()
