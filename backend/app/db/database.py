import os
import json
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.config import settings
from app.db.seed import INITIAL_DATA
from app.core.hasher import hamming_distance

class JSONDatabase:
    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.db_path = settings.DB_PATH
        self.data_dir = os.path.dirname(self.db_path)
        self._ensure_db()

    def _ensure_db(self):
        with self._lock:
            if not os.path.exists(self.data_dir):
                os.makedirs(self.data_dir, exist_ok=True)
            if not os.path.exists(self.db_path):
                with open(self.db_path, "w", encoding="utf-8") as f:
                    json.dump(INITIAL_DATA, f, indent=2)

    def _read(self) -> Dict[str, Any]:
        with self._lock:
            try:
                with open(self.db_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return INITIAL_DATA

    def _write(self, data: Dict[str, Any]):
        with self._lock:
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

    # 1. HASH DATABASE METHODS
    def get_all_hashes(self) -> List[Dict[str, Any]]:
        data = self._read()
        return data.get("moderation_hashes", [])

    def find_hash_by_sha256(self, sha256_hash: str) -> Optional[Dict[str, Any]]:
        hashes = self.get_all_hashes()
        for item in hashes:
            if item.get("sha256", "").lower() == sha256_hash.lower():
                return item
        return None

    def find_match_by_phash(self, phash: str, threshold: int = 10) -> Optional[Dict[str, Any]]:
        hashes = self.get_all_hashes()
        best_match = None
        min_dist = 999

        for item in hashes:
            item_phash = item.get("phash", "")
            if item_phash:
                dist = hamming_distance(phash, item_phash)
                if dist <= threshold and dist < min_dist:
                    min_dist = dist
                    best_match = {**item, "_match_hamming_distance": dist}

        return best_match

    def add_moderation_hash(self, hash_entry: Dict[str, Any]) -> Dict[str, Any]:
        data = self._read()
        hashes = data.get("moderation_hashes", [])
        
        # Check if already present by SHA-256
        existing = next((h for h in hashes if h.get("sha256") == hash_entry.get("sha256")), None)
        if existing:
            existing.update(hash_entry)
            result = existing
        else:
            if "id" not in hash_entry:
                hash_entry["id"] = f"hash_tl_{len(hashes) + 1:04d}"
            if "reported_at" not in hash_entry:
                hash_entry["reported_at"] = datetime.now(timezone.utc).isoformat()
            hashes.insert(0, hash_entry)
            result = hash_entry

        data["moderation_hashes"] = hashes
        # update stats
        data["stats"]["hash_database_size"] = len(hashes)
        data["stats"]["flagged_assets"] = data["stats"].get("flagged_assets", 0) + 1
        self._write(data)
        return result

    # 2. REPORTS METHODS
    def get_all_reports(self) -> List[Dict[str, Any]]:
        data = self._read()
        return data.get("reports", [])

    def get_report_by_id(self, report_id: str) -> Optional[Dict[str, Any]]:
        reports = self.get_all_reports()
        for rep in reports:
            if rep.get("id") == report_id:
                return rep
        return None

    def create_report(self, report_entry: Dict[str, Any]) -> Dict[str, Any]:
        data = self._read()
        reports = data.get("reports", [])
        
        # Check for duplicates by sha256 or phash
        sha = report_entry.get("sha256")
        phash = report_entry.get("phash")
        duplicate = None

        if sha:
            duplicate = next((r for r in reports if r.get("sha256") == sha), None)
        if not duplicate and phash:
            duplicate = next((r for r in reports if r.get("phash") and hamming_distance(phash, r["phash"]) <= 8), None)

        now_str = datetime.now(timezone.utc).isoformat()

        if duplicate:
            # Increment duplicate cluster count and increase viral velocity
            duplicate["duplicate_count"] = duplicate.get("duplicate_count", 1) + 1
            duplicate["viral_velocity_score"] = min(99, duplicate.get("viral_velocity_score", 40) + 8)
            if duplicate["viral_velocity_score"] > 85:
                duplicate["velocity_tier"] = "EXPLOSIVE"
            elif duplicate["viral_velocity_score"] > 65:
                duplicate["velocity_tier"] = "HIGH"
            duplicate["updated_at"] = now_str
            result = duplicate
        else:
            if "id" not in report_entry:
                report_entry["id"] = f"rep_{len(reports) + 101}"
            report_entry["duplicate_count"] = 1
            report_entry["viral_velocity_score"] = 35
            report_entry["velocity_tier"] = "MODERATE"
            report_entry["created_at"] = now_str
            report_entry["updated_at"] = now_str
            report_entry["status"] = "pending"
            reports.insert(0, report_entry)
            result = report_entry

        data["reports"] = reports
        self._write(data)
        return result

    def update_report_status(self, report_id: str, status: str, moderator_notes: Optional[str] = None, add_to_global: bool = True) -> Optional[Dict[str, Any]]:
        data = self._read()
        reports = data.get("reports", [])
        rep = next((r for r in reports if r.get("id") == report_id), None)
        if not rep:
            return None

        rep["status"] = status
        rep["updated_at"] = datetime.now(timezone.utc).isoformat()
        if moderator_notes:
            rep["moderator_notes"] = moderator_notes

        # If confirmed manipulated and flag requested, sync to moderation_hashes
        if status == "confirmed_manipulated" and add_to_global:
            self.add_moderation_hash({
                "id": f"hash_{rep['id']}",
                "sha256": rep.get("sha256"),
                "phash": rep.get("phash"),
                "title": rep.get("title", "Community Verified Flag"),
                "category": rep.get("reason", "manipulated_media"),
                "risk_level": "HIGH_RISK_MANIPULATED",
                "trust_score": 15,
                "status": "CONFIRMED_MANIPULATED",
                "source_platform": rep.get("platform", "Community Report"),
                "viral_count": rep.get("duplicate_count", 1) * 250,
                "verified_by": "Moderator Decision Portal",
                "notes": moderator_notes or "Verified through community report escalation.",
                "thumbnail_url": rep.get("thumbnail_url")
            })

            # Also create an active alert if viral velocity is high
            if rep.get("viral_velocity_score", 0) > 60:
                self.create_alert({
                    "title": f"MODERATED: Flagged Content [{rep.get('platform')}]",
                    "category": rep.get("reason", "deepfakes"),
                    "severity": "HIGH",
                    "message": f"Asset '{rep.get('title')}' on {rep.get('platform')} confirmed manipulated by community governance.",
                    "report_id": rep["id"],
                    "sha256": rep.get("sha256"),
                    "viral_velocity": rep.get("viral_velocity_score", 70),
                    "platforms_affected": [rep.get("platform", "Unknown")]
                })

        data["reports"] = reports
        self._write(data)
        return rep

    # 3. PARTNERS METHODS
    def get_all_partners(self) -> List[Dict[str, Any]]:
        data = self._read()
        return data.get("partners", [])

    def verify_partner_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        partners = self.get_all_partners()
        for p in partners:
            if p.get("api_key") == api_key and p.get("is_active"):
                return p
        return None

    def record_partner_query(self, api_key: str):
        data = self._read()
        partners = data.get("partners", [])
        for p in partners:
            if p.get("api_key") == api_key:
                p["total_queries"] = p.get("total_queries", 0) + 1
                p["last_sync"] = datetime.now(timezone.utc).isoformat()
                break
        data["stats"]["partner_queries_24h"] = data["stats"].get("partner_queries_24h", 0) + 1
        self._write(data)

    def register_partner(self, platform_name: str, contact_email: str, webhook_url: Optional[str] = None) -> Dict[str, Any]:
        data = self._read()
        partners = data.get("partners", [])
        new_partner = {
            "id": f"part_{len(partners) + 1:02d}",
            "name": platform_name,
            "api_key": f"tl_partner_{os.urandom(6).hex()}",
            "webhook_url": webhook_url or f"https://api.{platform_name.lower().replace(' ', '')}.com/moderation/webhook",
            "is_active": True,
            "total_queries": 0,
            "flags_submitted": 0,
            "last_sync": datetime.now(timezone.utc).isoformat()
        }
        partners.append(new_partner)
        data["partners"] = partners
        self._write(data)
        return new_partner

    # 4. ALERTS METHODS
    def get_all_alerts(self) -> List[Dict[str, Any]]:
        data = self._read()
        return data.get("alerts", [])

    def create_alert(self, alert_entry: Dict[str, Any]) -> Dict[str, Any]:
        data = self._read()
        alerts = data.get("alerts", [])
        if "id" not in alert_entry:
            alert_entry["id"] = f"alt_{len(alerts) + 1:03d}"
        if "created_at" not in alert_entry:
            alert_entry["created_at"] = datetime.now(timezone.utc).isoformat()
        alerts.insert(0, alert_entry)
        data["alerts"] = alerts
        data["stats"]["global_alerts_active"] = len(alerts)
        self._write(data)
        return alert_entry

    # 5. STATS
    def get_stats(self) -> Dict[str, Any]:
        data = self._read()
        return data.get("stats", {
            "scans_completed": 0,
            "flagged_assets": 0,
            "global_alerts_active": 0,
            "hash_database_size": 0,
            "viral_interceptions_today": 0,
            "partner_queries_24h": 0
        })

    def increment_scan_count(self):
        data = self._read()
        data["stats"]["scans_completed"] = data["stats"].get("scans_completed", 0) + 1
        self._write(data)

db = JSONDatabase()
