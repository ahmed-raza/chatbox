"""
Application configuration settings
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""

    def __init__(self):
        # Database
        self.database_url = os.getenv("DATABASE_URL", "file:./prisma/dev.db")

        # JWT Settings
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY")
        if not self.jwt_secret_key:
            raise ValueError("JWT_SECRET_KEY environment variable is required")

        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_access_token_expire_minutes = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.jwt_refresh_token_expire_days = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))

        # Password Reset
        self.password_reset_token_expire_minutes = int(os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "15"))

        # Email Settings (for password reset)
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        self.email_from = os.getenv("EMAIL_FROM")
        self.email_from_name = os.getenv("EMAIL_FROM_NAME", "Chat App")

        # Application
        self.app_name = os.getenv("APP_NAME", "Chat Application")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

        # CORS
        cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        self.cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]


# Global settings instance
settings = Settings()
