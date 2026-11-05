from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class HashCheckRequest(BaseModel):
    sha256: Optional[str] = None
    phash: Optional[str] = None
    threshold: int = Field(default=10, ge=0, le=32)

class HashMatchResult(BaseModel):
    matched: bool
    match_type: Optional[str] = None  # "EXACT_SHA256" or "PERCEPTUAL_PHASH"
    hamming_distance: Optional[int] = None
    item: Optional[Dict[str, Any]] = None

class FlagContentRequest(BaseModel):
    sha256: str
    phash: Optional[str] = None
    title: str
    category: str
    risk_level: str = "HIGH_RISK_MANIPULATED"
    source_platform: str
    post_url: Optional[str] = None
    evidence_text: Optional[str] = None
    notes: Optional[str] = None
    thumbnail_url: Optional[str] = None

class CreateReportRequest(BaseModel):
    sha256: str
    phash: Optional[str] = None
    title: str
    platform: str
    post_url: str
    reason: str
    evidence_text: str
    reporter_handle: Optional[str] = "Anonymous Citizen"
    thumbnail_url: Optional[str] = None

class UpdateReportStatusRequest(BaseModel):
    status: str  # "confirmed_manipulated", "cleared", "under_review", "pending"
    moderator_notes: Optional[str] = None
    add_to_global_hashes: bool = True

class AlertSubscriptionRequest(BaseModel):
    email: Optional[str] = None
    categories: List[str]
    webhook_url: Optional[str] = None

class PartnerRegistrationRequest(BaseModel):
    platform_name: str
    webhook_url: Optional[str] = None
    contact_email: str
