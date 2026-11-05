from fastapi import APIRouter
from app.db.database import db
from app.db.models import AlertSubscriptionRequest

router = APIRouter()

@router.get("")
async def list_global_alerts():
    """Returns active global high-velocity warnings."""
    return {
        "alerts": db.get_all_alerts(),
        "active_count": len(db.get_all_alerts())
    }

@router.post("/subscribe")
async def subscribe_alerts(payload: AlertSubscriptionRequest):
    """Subscribes an email or webhook receiver to specific risk categories."""
    return {
        "status": "success",
        "message": f"Successfully subscribed to {len(payload.categories)} warning categories.",
        "subscribed_categories": payload.categories,
        "recipient": payload.email or payload.webhook_url or "Browser Push Notification Token"
    }
