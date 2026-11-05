import os

class Settings:
    PROJECT_NAME: str = "True Lens AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "truelens-super-secret-key-production-grade-2026")
    PARTNER_API_KEY: str = os.getenv("PARTNER_API_KEY", "tl_partner_live_8f93a2c091be4f")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    DB_PATH: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "truelens.json")

settings = Settings()
