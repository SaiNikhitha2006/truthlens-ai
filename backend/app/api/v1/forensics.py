import base64
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from pydantic import BaseModel, Field

from app.core.ela import perform_ela
from app.core.spectral import analyze_frequency_spectrum
from app.core.anomaly import calculate_composite_trust
from app.core.hasher import compute_sha256, compute_phash, hamming_distance
from app.core.samples import get_sample_catalogue
from app.core.copymove import detect_copy_move
from app.core.colorspace import analyze_chrominance_channels
from app.core.face_forensics import analyze_facial_forensics
from app.core.prnu import generate_noise_print
from app.db.database import db

router = APIRouter()

class UrlAnalyzeRequest(BaseModel):
    image_url: Optional[str] = None
    image_base64: Optional[str] = None

class TuneElaRequest(BaseModel):
    image_base64: str
    quality: int = Field(default=90, ge=50, le=99)
    scale: int = Field(default=20, ge=1, le=50)
    colormap: str = "turbo"

def _run_full_forensics(image_bytes: bytes, file_name: str = "uploaded_asset.jpg") -> dict:
    if len(image_bytes) < 100:
        raise HTTPException(status_code=400, detail="Invalid image payload; file is empty or corrupted.")

    # 1. Cryptographic Fingerprints
    sha256_hash = compute_sha256(image_bytes)
    phash_val = compute_phash(image_bytes)

    # 2. Global Fingerprint Database Lookup
    db_match = None
    exact_match = db.find_hash_by_sha256(sha256_hash)
    if exact_match:
        db_match = {
            "matched": True,
            "match_type": "EXACT_SHA256",
            "hamming_distance": 0,
            "details": exact_match
        }
    else:
        phash_match = db.find_match_by_phash(phash_val, threshold=10)
        if phash_match:
            db_match = {
                "matched": True,
                "match_type": "PERCEPTUAL_PHASH_NEAR_DUPLICATE",
                "hamming_distance": phash_match.get("_match_hamming_distance", 0),
                "details": phash_match
            }
        else:
            db_match = {
                "matched": False,
                "match_type": "NONE",
                "hamming_distance": None,
                "details": None
            }

    # 3. Core Forensics: ELA
    ela_res = perform_ela(image_bytes, quality=90, scale=20, colormap_name="turbo")

    # 4. Core Forensics: Frequency-Based Spectral Analysis (FFT)
    spectral_res = analyze_frequency_spectrum(image_bytes)

    # 5. Advanced Forensics: Copy-Move Forgery Detection (CMFD)
    copymove_res = detect_copy_move(image_bytes)

    # 6. Advanced Forensics: Chrominance Color Space Analysis (YCbCr)
    chroma_res = analyze_chrominance_channels(image_bytes)

    # 7. Advanced Forensics: Facial Boundary & Specular Highlight Seams
    face_res = analyze_facial_forensics(image_bytes)

    # 8. Advanced Forensics: PRNU Sensor Noise Print
    prnu_res = generate_noise_print(image_bytes)

    # 9. Composite Trust & Anomaly Analysis
    anomaly_res = calculate_composite_trust(ela_res, spectral_res, image_bytes)

    # Adjust trust score if copy-move or facial seam anomalies exist
    if copymove_res.get("detected"):
        anomaly_res["trust_score"] = min(anomaly_res["trust_score"], 28)
        anomaly_res["risk_level"] = "HIGH_RISK_MANIPULATED"
        anomaly_res["findings"].append({
            "type": "COPY_MOVE_FORGERY",
            "severity": "HIGH",
            "message": copymove_res["explanation"]
        })

    if face_res.get("face_detected") and face_res.get("boundary_seam_score", 90) < 50:
        anomaly_res["trust_score"] = min(anomaly_res["trust_score"], 25)
        anomaly_res["risk_level"] = "AI_GENERATED"
        anomaly_res["findings"].append({
            "type": "FACIAL_SEAM_BLENDING",
            "severity": "HIGH",
            "message": face_res["findings"][0] if face_res["findings"] else "Facial seam feathering detected."
        })

    if chroma_res.get("score", 90) < 45:
        anomaly_res["findings"].append({
            "type": "CHROMINANCE_ANOMALY",
            "severity": "MEDIUM",
            "message": chroma_res["explanation"]
        })

    # If already confirmed in global database as manipulated, calibrate score
    if db_match["matched"] and db_match["details"].get("status") == "CONFIRMED_MANIPULATED":
        anomaly_res["trust_score"] = min(anomaly_res["trust_score"], db_match["details"].get("trust_score", 15))
        anomaly_res["risk_level"] = db_match["details"].get("risk_level", "HIGH_RISK_MANIPULATED")
        anomaly_res["findings"].insert(0, {
            "type": "KNOWN_DATABASE_MATCH",
            "severity": "CRITICAL",
            "message": f"Cryptographic match found in True Lens Global Fingerprint DB ({db_match['match_type']}). Previously verified as {db_match['details'].get('category')}."
        })

    # Prepare preview
    original_b64 = f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    # Increment scan count in stats
    db.increment_scan_count()

    return {
        "status": "success",
        "file_name": file_name,
        "sha256": sha256_hash,
        "phash": phash_val,
        "database_match": db_match,
        "trust_score": anomaly_res["trust_score"],
        "risk_level": anomaly_res["risk_level"],
        "verdict_title": anomaly_res["verdict_title"],
        "confidence_interval": anomaly_res["confidence_interval"],
        "breakdown": {
            **anomaly_res["breakdown"],
            "copy_move_integrity": 100 - copymove_res.get("confidence_score", 10) if copymove_res.get("detected") else 95,
            "chrominance_coherence": chroma_res.get("score", 85),
            "prnu_sensor_uniformity": prnu_res.get("score", 88)
        },
        "findings": anomaly_res["findings"],
        "metadata_summary": anomaly_res["metadata_summary"],
        "noise_summary": anomaly_res["noise_summary"],
        "edge_summary": anomaly_res["edge_summary"],
        "ela": ela_res,
        "spectral": spectral_res,
        "copymove": copymove_res,
        "chrominance": chroma_res,
        "facial_forensics": face_res,
        "prnu": prnu_res,
        "original_preview": original_b64
    }

@router.post("/analyze-upload")
async def analyze_upload(file: UploadFile = File(...)):
    """Receives multipart uploaded image and runs full digital forensic inspection."""
    try:
        content = await file.read()
        return _run_full_forensics(content, file_name=file.filename or "uploaded_asset.jpg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic engine failure: {str(e)}")

@router.post("/analyze-url")
async def analyze_url(payload: UrlAnalyzeRequest):
    """Analyzes an image from a public URL or raw base64 data string."""
    try:
        if payload.image_base64:
            b64_str = payload.image_base64
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            image_bytes = base64.b64decode(b64_str)
            return _run_full_forensics(image_bytes, file_name="imported_base64_asset.jpg")
        elif payload.image_url:
            resp = requests.get(payload.image_url, timeout=10)
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch image from URL.")
            return _run_full_forensics(resp.content, file_name=payload.image_url.split("/")[-1] or "remote_asset.jpg")
        else:
            raise HTTPException(status_code=400, detail="Provide either image_url or image_base64.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forensic engine failure: {str(e)}")

@router.post("/tune-ela")
async def tune_ela_parameters(payload: TuneElaRequest):
    """
    Interactive Forensic Tuner:
    Re-evaluates Error Level Analysis dynamically with custom JPEG quality,
    contrast multiplier scale, and colormap selection.
    """
    try:
        b64_str = payload.image_base64
        if "," in b64_str:
            b64_str = b64_str.split(",")[1]
        image_bytes = base64.b64decode(b64_str)
        return perform_ela(
            image_bytes,
            quality=payload.quality,
            scale=payload.scale,
            colormap_name=payload.colormap
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ELA Tuning error: {str(e)}")

@router.get("/samples")
async def list_sample_images():
    """Returns pre-rendered sample images for immediate zero-config testing."""
    return get_sample_catalogue()
