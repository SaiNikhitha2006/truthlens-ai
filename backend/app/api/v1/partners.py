from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.db.database import db
from app.db.models import PartnerRegistrationRequest

router = APIRouter()

class TestWebhookPayload(BaseModel):
    partner_id: str
    event_type: str = "FLAG_DETECTED"
    sample_hash: Optional[str] = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

@router.get("")
async def get_partners():
    """Lists registered partner platforms and their integration metrics."""
    return {
        "partners": db.get_all_partners(),
        "disclaimer": "True Lens operates via mutual API integration. Content on unpartnered platforms cannot be forcibly moderated without bilateral API agreements and cryptographic trust federation."
    }

@router.post("/register")
async def register_partner(payload: PartnerRegistrationRequest):
    """Generates partner API credentials for a platform or fact-checking organization."""
    new_partner = db.register_partner(
        platform_name=payload.platform_name,
        contact_email=payload.contact_email,
        webhook_url=payload.webhook_url
    )
    return {
        "status": "success",
        "message": f"Partner '{payload.platform_name}' successfully provisioned.",
        "partner": new_partner
    }

@router.post("/test-webhook")
async def trigger_test_webhook(payload: TestWebhookPayload):
    """Simulates real-time webhook dispatch to a partner platform."""
    partners = db.get_all_partners()
    target = next((p for p in partners if p["id"] == payload.partner_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Partner ID not found.")

    simulated_payload = {
        "event": payload.event_type,
        "platform_target": target["name"],
        "target_webhook": target["webhook_url"],
        "asset_sha256": payload.sample_hash,
        "action_required": "APPLY_CONTENT_WARNING_LABEL",
        "jurisdiction": "GLOBAL_GOVERNANCE_CONSORTIUM",
        "status": "DISPATCH_ACKNOWLEDGED_200"
    }

    return {
        "status": "success",
        "message": f"Webhook payload successfully delivered to {target['name']}.",
        "dispatched_event": simulated_payload
    }
