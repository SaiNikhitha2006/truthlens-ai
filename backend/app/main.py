from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1 import forensics, moderation, reports, partners, alerts, stats

app = FastAPI(
    title="True Lens AI Backend",
    description="Digital Forensics & Cross-Platform Misinformation Mitigation Engine",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local development and network testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 Routers
app.include_router(forensics.router, prefix="/api/v1/forensics", tags=["Digital Forensics"])
app.include_router(moderation.router, prefix="/api/v1/moderation", tags=["Platform Moderation API"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Community Reporting"])
app.include_router(partners.router, prefix="/api/v1/partners", tags=["Platform Partners"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Global Alerts"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["System Statistics"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "True Lens AI Forensics Backend",
        "version": settings.VERSION
    }

@app.get("/")
async def root():
    return {
        "message": "True Lens AI Forensics & Content Verification API",
        "docs": "/docs",
        "health": "/health"
    }
