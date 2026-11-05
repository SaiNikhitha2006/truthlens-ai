from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.db.database import db
from app.db.models import CreateReportRequest, UpdateReportStatusRequest

router = APIRouter()

@router.get("")
async def list_reports(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by_velocity: bool = True
):
    """
    Returns list of community reports with cluster duplicate tracking and viral velocity ranking.
    """
    reports = db.get_all_reports()

    # Filter by platform
    if platform and platform != "all":
        reports = [r for r in reports if r.get("platform", "").lower() == platform.lower()]

    # Filter by status
    if status and status != "all":
        reports = [r for r in reports if r.get("status", "").lower() == status.lower()]

    # Filter by search term
    if search:
        s = search.lower()
        reports = [
            r for r in reports
            if s in r.get("title", "").lower()
            or s in r.get("reason", "").lower()
            or s in r.get("sha256", "").lower()
            or s in r.get("evidence_text", "").lower()
        ]

    # Sort
    if sort_by_velocity:
        reports = sorted(reports, key=lambda x: x.get("viral_velocity_score", 0), reverse=True)

    return {
        "total": len(reports),
        "reports": reports
    }

@router.get("/{report_id}")
async def get_report_details(report_id: str):
    """
    Fetches full forensic verification dossier for a specific report.
    Powers shareable warning links (/verify/{report_id}).
    """
    report = db.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail=f"Verification report '{report_id}' not found.")

    # Cross-reference with moderation hash database
    hash_match = None
    if report.get("sha256"):
        hash_match = db.find_hash_by_sha256(report["sha256"])

    return {
        "report": report,
        "moderation_record": hash_match,
        "shareable_url": f"/verify/{report['id']}",
        "viral_warning_active": report.get("viral_velocity_score", 0) > 60
    }

@router.post("")
async def submit_community_report(payload: CreateReportRequest):
    """
    Cross-Platform Reporting System:
    Allows citizens and fact-checkers to submit a flagged post across X, Facebook, Reddit, etc.
    Automatically clusters duplicates by image hash and updates viral velocity.
    """
    created_or_updated = db.create_report({
        "sha256": payload.sha256,
        "phash": payload.phash,
        "title": payload.title,
        "platform": payload.platform,
        "post_url": payload.post_url,
        "reason": payload.reason,
        "evidence_text": payload.evidence_text,
        "reporter_handle": payload.reporter_handle or "Anonymous Citizen",
        "thumbnail_url": payload.thumbnail_url
    })

    return {
        "status": "success",
        "message": "Report logged into community governance network.",
        "report": created_or_updated,
        "is_duplicate_cluster": created_or_updated.get("duplicate_count", 1) > 1
    }

@router.patch("/{report_id}/status")
async def update_report_status(report_id: str, payload: UpdateReportStatusRequest):
    """
    Admin Decision Portal:
    Allows human moderators to review flagged submissions, update status, and
    dispatch entries to the global hash database.
    """
    updated = db.update_report_status(
        report_id=report_id,
        status=payload.status,
        moderator_notes=payload.moderator_notes,
        add_to_global=payload.add_to_global_hashes
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Report not found.")

    return {
        "status": "success",
        "message": f"Report status updated to '{payload.status}'.",
        "report": updated
    }
