from fastapi import APIRouter, Header, HTTPException, Query
from typing import Optional
from app.db.database import db
from app.db.models import HashCheckRequest, HashMatchResult, FlagContentRequest
from app.core.hasher import hamming_distance

router = APIRouter()

@router.post("/check-hash", response_model=HashMatchResult)
async def check_hash(payload: HashCheckRequest, x_api_key: Optional[str] = Header(None)):
    """
    Platform Partner Integration Endpoint:
    Checks if a SHA-256 or pHash matches any known manipulated asset in the Global Moderation Database.
    Supports perceptual hash matching with Hamming distance tolerance (default <= 10 bits).
    """
    if x_api_key:
        db.record_partner_query(x_api_key)

    # 1. Exact SHA-256 Check
    if payload.sha256:
        exact = db.find_hash_by_sha256(payload.sha256)
        if exact:
            return HashMatchResult(
                matched=True,
                match_type="EXACT_SHA256",
                hamming_distance=0,
                item=exact
            )

    # 2. Perceptual Hash Check
    if payload.phash:
        match = db.find_match_by_phash(payload.phash, threshold=payload.threshold)
        if match:
            return HashMatchResult(
                matched=True,
                match_type="PERCEPTUAL_PHASH",
                hamming_distance=match.get("_match_hamming_distance", 0),
                item=match
            )

    return HashMatchResult(
        matched=False,
        match_type=None,
        hamming_distance=None,
        item=None
    )

@router.post("/flag")
async def flag_content(payload: FlagContentRequest, x_api_key: Optional[str] = Header(None)):
    """
    Allows partner platforms or authorized moderators to add an identified manipulated asset
    directly to the Global Moderation Fingerprint Database.
    """
    partner = None
    if x_api_key:
        partner = db.verify_partner_key(x_api_key)
        if not partner:
            raise HTTPException(status_code=401, detail="Invalid Partner API Key.")

    new_hash = db.add_moderation_hash({
        "sha256": payload.sha256,
        "phash": payload.phash,
        "title": payload.title,
        "category": payload.category,
        "risk_level": payload.risk_level,
        "trust_score": 15,
        "status": "CONFIRMED_MANIPULATED",
        "source_platform": payload.source_platform,
        "viral_count": 100,
        "verified_by": partner["name"] if partner else "TrueLens Moderator API",
        "notes": payload.notes or payload.evidence_text or "Flagged via Partner Integration Endpoint",
        "thumbnail_url": payload.thumbnail_url
    })

    return {
        "status": "success",
        "message": "Content successfully fingerprinted and added to Global Moderation Database.",
        "item": new_hash
    }

@router.get("/hashes")
async def list_moderation_hashes(limit: int = Query(50, ge=1, le=200)):
    """Returns stored cryptographic hashes from the Global Fingerprint Database."""
    all_hashes = db.get_all_hashes()
    return {
        "total_count": len(all_hashes),
        "items": all_hashes[:limit]
    }
