from fastapi import APIRouter
from app.db.database import db

router = APIRouter()

@router.get("")
async def get_system_stats():
    """Returns platform live metrics for home dashboard."""
    stats = db.get_stats()
    reports = db.get_all_reports()
    alerts = db.get_all_alerts()
    partners = db.get_all_partners()

    # Calculate real-time aggregations
    active_disinformation_clusters = sum(1 for r in reports if r.get("viral_velocity_score", 0) > 70)
    confirmed_tampered_count = sum(1 for r in reports if r.get("status") == "confirmed_manipulated")

    return {
        "stats": {
            **stats,
            "active_disinformation_clusters": active_disinformation_clusters,
            "confirmed_tampered_count": confirmed_tampered_count,
            "active_partners": len(partners),
            "critical_alerts_count": sum(1 for a in alerts if a.get("severity") == "CRITICAL")
        }
    }
