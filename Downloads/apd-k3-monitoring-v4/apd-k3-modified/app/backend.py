"""
app/backend.py – REST API Backend untuk Sistem Monitoring APD
Proyek Capstone: Deteksi APD Otomatis
Kelompok 04 – Universitas Brawijaya 2026

Optimized: Multi-SQL Dialect Compatibility & Seamless .env Sync
v2.0: Tambah Role-Based Access Control (Supervisor / Admin)
"""

import os
import json
import uuid
import datetime
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Float, desc
from sqlalchemy.orm import sessionmaker, declarative_base, Session

load_dotenv()

# ──────────────────────────────────────────────────────────────
# CONFIG & STORAGE TOGGLE DETECTOR
# ──────────────────────────────────────────────────────────────
CAPTURE_DIR  = Path(os.getenv("CAPTURE_DIR", "captures"))
LOG_PATH     = CAPTURE_DIR / "violation_log.json"
CAPTURE_DIR.mkdir(parents=True, exist_ok=True)

VIOLATION_CLASSES = {"no helmet", "no vest", "no boots"}
API_KEY = os.getenv("API_KEY", "K3_SecretKey_2026")

USE_POSTGRES = os.getenv("USE_POSTGRES", "False").lower() == "true"

if USE_POSTGRES:
    DB_USER     = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_HOST     = os.getenv("DB_HOST", "db")
    DB_PORT     = os.getenv("DB_PORT", "5432")
    DB_NAME     = os.getenv("DB_NAME", "apd_monitor")

    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    class ViolationTable(Base):
        __tablename__ = "violations"
        id            = Column(String, primary_key=True, index=True)
        timestamp     = Column(String, nullable=False)
        violations    = Column(String, nullable=False)
        image_path    = Column(String, nullable=True)
        confidence    = Column(Float, nullable=True)
        area          = Column(String, default="Area Tidak Diketahui")
        camera        = Column(String, default="Kamera 1")
        # ── Kolom baru untuk alur validasi Supervisor ──────────
        status        = Column(String, default="pending")   # pending | approved | rejected
        validated_by  = Column(String, nullable=True)       # username Supervisor
        validated_at  = Column(String, nullable=True)       # ISO timestamp validasi
        notes         = Column(String, nullable=True)       # catatan dari Supervisor

    Base.metadata.create_all(bind=engine)

    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
else:
    def get_db():
        yield None


# ──────────────────────────────────────────────────────────────
# USER STORE (role-based — bisa dipindah ke DB di production)
# ──────────────────────────────────────────────────────────────
# Format: { username: { "password": ..., "role": "supervisor"|"admin" } }
USERS = {
    os.getenv("SUPERVISOR_USER", "supervisor"): {
        "password": os.getenv("SUPERVISOR_PASS", "supervisor123"),
        "role": "supervisor",
    },
    os.getenv("ADMIN_USER", "admin"): {
        "password": os.getenv("ADMIN_PASS", "admin123"),
        "role": "admin",
    },
}


# ──────────────────────────────────────────────────────────────
# AUTH HELPERS
# ──────────────────────────────────────────────────────────────
async def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API Key tidak valid atau tidak ditemukan")
    return x_api_key


def get_current_user(x_username: str = Header(None), x_password: str = Header(None)):
    """Dependency: validasi kredensial via header X-Username + X-Password."""
    if not x_username or not x_password:
        raise HTTPException(status_code=401, detail="Header X-Username dan X-Password wajib diisi.")
    user = USERS.get(x_username)
    if not user or user["password"] != x_password:
        raise HTTPException(status_code=401, detail="Kredensial tidak valid.")
    return {"username": x_username, "role": user["role"]}


def require_supervisor(current_user: dict = Depends(get_current_user)):
    """Dependency: hanya Supervisor yang boleh akses endpoint ini."""
    if current_user["role"] != "supervisor":
        raise HTTPException(status_code=403, detail="Akses ditolak. Hanya Supervisor yang dapat melakukan tindakan ini.")
    return current_user


# ──────────────────────────────────────────────────────────────
# APP INITIALIZATION
# ──────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "K3In APD Monitor Rest-API",
    description = f"REST API Core Engine (Storage: {'PostgreSQL' if USE_POSTGRES else 'JSON File'}) — v2.0 RBAC",
    version     = "2.0.0",
    docs_url    = "/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

app.mount("/captures", StaticFiles(directory=str(CAPTURE_DIR)), name="captures")


# ──────────────────────────────────────────────────────────────
# PYDANTIC MODELS
# ──────────────────────────────────────────────────────────────
class ViolationRecord(BaseModel):
    id           : str
    timestamp    : str
    violations   : List[str]
    image_path   : Optional[str] = None
    image_url    : Optional[str] = None
    confidence   : Optional[float] = None
    area         : Optional[str] = "Area Tidak Diketahui"
    camera       : Optional[str] = "Kamera 1"
    # Field validasi
    status       : Optional[str] = "pending"
    validated_by : Optional[str] = None
    validated_at : Optional[str] = None
    notes        : Optional[str] = None


class StatsSummary(BaseModel):
    total_violations    : int
    today_violations    : int
    no_helmet_count     : int
    no_vest_count       : int
    no_boots_count      : int
    compliance_rate     : float
    last_violation_time : Optional[str]
    pending_count       : int   # tambahan: antrian menunggu validasi
    approved_count      : int
    rejected_count      : int


class ValidationRequest(BaseModel):
    action : str            # "approve" atau "reject"
    notes  : Optional[str] = None


class LoginRequest(BaseModel):
    username : str
    password : str


# ──────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────
def load_log() -> List[dict]:
    if not LOG_PATH.exists(): return []
    try: return json.loads(LOG_PATH.read_text(encoding="utf-8"))
    except: return []


def save_log(data: List[dict]):
    LOG_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def record_to_model(r: dict, base_url: str = "") -> ViolationRecord:
    img_path = r.get("image_path", "")
    img_url  = f"{base_url}/captures/{Path(img_path).name}" if img_path and Path(img_path).exists() else None

    v_raw = r.get("violations", [])
    if isinstance(v_raw, str):
        try: v_list = json.loads(v_raw)
        except: v_list = [v_raw]
    else:
        v_list = v_raw

    return ViolationRecord(
        id=r.get("id", str(uuid.uuid4())), timestamp=r.get("timestamp", ""),
        violations=v_list, image_path=img_path, image_url=img_url,
        confidence=r.get("confidence"), area=r.get("area", "Area Tidak Diketahui"),
        camera=r.get("camera", "Kamera 1"),
        status=r.get("status", "pending"),
        validated_by=r.get("validated_by"),
        validated_at=r.get("validated_at"),
        notes=r.get("notes"),
    )


# ──────────────────────────────────────────────────────────────
# ENDPOINTS
# ──────────────────────────────────────────────────────────────

@app.get("/", tags=["Info"])
def root():
    return {
        "service"      : "K3In REST-API Core Engine v2.0",
        "storage_mode" : "PostgreSQL" if USE_POSTGRES else "JSON File Fallback",
        "status"       : "online",
        "rbac"         : "enabled",
    }


# ── Auth ────────────────────────────────────────────────────
@app.post("/api/v1/auth/login", tags=["Auth"])
def login(req: LoginRequest):
    """Verifikasi kredensial dan kembalikan role pengguna."""
    user = USERS.get(req.username)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Username atau password salah.")
    return {"username": req.username, "role": user["role"], "status": "authenticated"}


# ── 1. POST VIOLATION (dipanggil skrip deteksi YOLOv8) ──────
@app.post("/api/v1/violations", tags=["Violations"], status_code=201, dependencies=[Depends(verify_api_key)])
async def create_violation(
    violations : str        = Form(...),
    confidence : float      = Form(None),
    area       : str        = Form("Area Tidak Diketahui"),
    camera     : str        = Form("Kamera 1"),
    image      : UploadFile = File(None),
    db         : Session    = Depends(get_db)
):
    try:
        viol_list = json.loads(violations)
        if not isinstance(viol_list, list): raise ValueError
    except:
        raise HTTPException(status_code=422, detail="Format violations harus berupa JSON array string.")

    invalid = [v for v in viol_list if v not in VIOLATION_CLASSES]
    if invalid: raise HTTPException(status_code=422, detail=f"Kelas tidak valid: {invalid}")

    image_path = None
    if image and image.filename:
        ts_str     = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:19]
        fname      = f"violation_{ts_str}{Path(image.filename).suffix or '.jpg'}"
        image_path = str(CAPTURE_DIR / fname)
        with open(image_path, "wb") as f:
            shutil.copyfileobj(image.file, f)

    record = {
        "id"          : str(uuid.uuid4()),
        "timestamp"   : datetime.datetime.now().isoformat(),
        "violations"  : json.dumps(viol_list) if USE_POSTGRES else viol_list,
        "image_path"  : image_path,
        "confidence"  : confidence,
        "area"        : area,
        "camera"      : camera,
        "status"      : "pending",      # ← semua deteksi baru masuk sebagai pending
        "validated_by": None,
        "validated_at": None,
        "notes"       : None,
    }

    if USE_POSTGRES:
        new_row = ViolationTable(**record)
        db.add(new_row)
        db.commit()
    else:
        data = load_log()
        data.append(record)
        save_log(data)

    return {"status": "created", "id": record["id"], "message": "Pelanggaran dicatat. Menunggu validasi Supervisor."}


# ── 2. GET ALL VIOLATIONS ────────────────────────────────────
@app.get("/api/v1/violations", tags=["Violations"], response_model=List[ViolationRecord])
def get_violations(
    limit       : int            = Query(50),
    offset      : int            = Query(0),
    type_filter : Optional[str]  = Query(None),
    date_from   : Optional[str]  = Query(None),
    date_to     : Optional[str]  = Query(None),
    status      : Optional[str]  = Query(None),   # filter: pending | approved | rejected
    db          : Session        = Depends(get_db)
):
    raw_records = []

    if USE_POSTGRES:
        query = db.query(ViolationTable)
        if type_filter:
            query = query.filter(ViolationTable.violations.like(f"%{type_filter}%"))
        if date_from:
            query = query.filter(ViolationTable.timestamp >= date_from)
        if date_to:
            query = query.filter(ViolationTable.timestamp <= date_to + "T23:59:59")
        if status:
            query = query.filter(ViolationTable.status == status)
        results = query.order_by(desc(ViolationTable.timestamp)).offset(offset).limit(limit).all()
        raw_records = [{c.name: getattr(row, c.name) for c in row.__table__.columns} for row in results]
    else:
        data = load_log()
        if type_filter:
            data = [r for r in data if type_filter in r.get("violations", [])]
        if date_from:
            data = [r for r in data if r.get("timestamp", "") >= date_from]
        if date_to:
            data = [r for r in data if r.get("timestamp", "") <= date_to + "T23:59:59"]
        if status:
            data = [r for r in data if r.get("status", "pending") == status]
        data = sorted(data, key=lambda r: r.get("timestamp", ""), reverse=True)
        raw_records = data[offset : offset + limit]

    return [record_to_model(r) for r in raw_records]


# ── 3. GET VIOLATION BY ID ───────────────────────────────────
@app.get("/api/v1/violations/{violation_id}", tags=["Violations"], response_model=ViolationRecord)
def get_violation_by_id(violation_id: str, db: Session = Depends(get_db)):
    record = None
    if USE_POSTGRES:
        row = db.query(ViolationTable).filter(ViolationTable.id == violation_id).first()
        if row:
            record = {c.name: getattr(row, c.name) for c in row.__table__.columns}
    else:
        data = load_log()
        record = next((r for r in data if r.get("id") == violation_id), None)

    if not record:
        raise HTTPException(status_code=404, detail="Pelanggaran tidak ditemukan.")
    return record_to_model(record)


# ── 4. VALIDATE VIOLATION (Supervisor only) ──────────────────
@app.patch("/api/v1/violations/{violation_id}/validate", tags=["Validation"])
def validate_violation(
    violation_id : str,
    req          : ValidationRequest,
    current_user : dict    = Depends(require_supervisor),
    db           : Session = Depends(get_db),
):
    """
    Supervisor melakukan approve/reject terhadap satu pelanggaran.
    - action: "approve" → status menjadi 'approved'
    - action: "reject"  → status menjadi 'rejected'
    """
    if req.action not in ("approve", "reject"):
        raise HTTPException(status_code=422, detail="action harus 'approve' atau 'reject'.")

    new_status   = "approved" if req.action == "approve" else "rejected"
    validated_at = datetime.datetime.now().isoformat()

    if USE_POSTGRES:
        row = db.query(ViolationTable).filter(ViolationTable.id == violation_id).first()
        if not row:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
        row.status       = new_status
        row.validated_by = current_user["username"]
        row.validated_at = validated_at
        row.notes        = req.notes
        db.commit()
    else:
        data = load_log()
        record = next((r for r in data if r.get("id") == violation_id), None)
        if not record:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
        record["status"]       = new_status
        record["validated_by"] = current_user["username"]
        record["validated_at"] = validated_at
        record["notes"]        = req.notes
        save_log(data)

    return {
        "status"       : "updated",
        "id"           : violation_id,
        "new_status"   : new_status,
        "validated_by" : current_user["username"],
        "validated_at" : validated_at,
    }


# ── 5. BULK VALIDATE (Supervisor only) ───────────────────────
class BulkValidationRequest(BaseModel):
    ids    : List[str]
    action : str
    notes  : Optional[str] = None


@app.patch("/api/v1/violations/bulk/validate", tags=["Validation"])
def bulk_validate(
    req          : BulkValidationRequest,
    current_user : dict    = Depends(require_supervisor),
    db           : Session = Depends(get_db),
):
    """Validasi massal beberapa pelanggaran sekaligus."""
    if req.action not in ("approve", "reject"):
        raise HTTPException(status_code=422, detail="action harus 'approve' atau 'reject'.")

    new_status   = "approved" if req.action == "approve" else "rejected"
    validated_at = datetime.datetime.now().isoformat()
    updated      = []

    if USE_POSTGRES:
        for vid in req.ids:
            row = db.query(ViolationTable).filter(ViolationTable.id == vid).first()
            if row:
                row.status       = new_status
                row.validated_by = current_user["username"]
                row.validated_at = validated_at
                row.notes        = req.notes
                updated.append(vid)
        db.commit()
    else:
        data = load_log()
        for record in data:
            if record.get("id") in req.ids:
                record["status"]       = new_status
                record["validated_by"] = current_user["username"]
                record["validated_at"] = validated_at
                record["notes"]        = req.notes
                updated.append(record["id"])
        save_log(data)

    return {"updated": len(updated), "ids": updated, "new_status": new_status}


# ── 6. DELETE VIOLATION ──────────────────────────────────────
@app.delete("/api/v1/violations/{violation_id}", tags=["Violations"], dependencies=[Depends(verify_api_key)])
def delete_violation(violation_id: str, db: Session = Depends(get_db)):
    img_path = None
    if USE_POSTGRES:
        row = db.query(ViolationTable).filter(ViolationTable.id == violation_id).first()
        if not row: raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
        img_path = row.image_path
        db.delete(row)
        db.commit()
    else:
        data = load_log()
        row = next((r for r in data if r.get("id") == violation_id), None)
        if not row: raise HTTPException(status_code=404, detail="Data tidak ditemukan.")
        img_path = row.get("image_path")
        data = [r for r in data if r.get("id") != violation_id]
        save_log(data)

    if img_path and Path(img_path).exists():
        Path(img_path).unlink()
    return {"status": "deleted", "id": violation_id}


# ── 7. STATS SUMMARY ─────────────────────────────────────────
@app.get("/api/v1/stats/summary", tags=["Statistics"], response_model=StatsSummary)
def get_stats_summary(db: Session = Depends(get_db)):
    if USE_POSTGRES:
        rows = db.query(ViolationTable).all()
        data = [{c.name: getattr(row, c.name) for c in row.__table__.columns} for row in rows]
    else:
        data = load_log()

    today = datetime.date.today().isoformat()
    today_data = [r for r in data if r.get("timestamp", "").startswith(today)]

    total     = len(data)
    today_tot = len(today_data)

    def check_viol(item, keyword):
        v = item.get("violations", [])
        if isinstance(v, str): return keyword in v
        return keyword in v

    no_helmet = sum(1 for r in data if check_viol(r, "no helmet"))
    no_vest   = sum(1 for r in data if check_viol(r, "no vest"))
    no_boots  = sum(1 for r in data if check_viol(r, "no boots"))

    base       = max(today_tot + 10, 10)
    compliance = max(0.0, min(100.0, round((1 - today_tot / base) * 100, 1)))

    last_time = None
    if data:
        last_time = sorted(data, key=lambda r: r.get("timestamp", ""), reverse=True)[0].get("timestamp")

    pending_count  = sum(1 for r in data if r.get("status", "pending") == "pending")
    approved_count = sum(1 for r in data if r.get("status", "pending") == "approved")
    rejected_count = sum(1 for r in data if r.get("status", "pending") == "rejected")

    return StatsSummary(
        total_violations=total, today_violations=today_tot,
        no_helmet_count=no_helmet, no_vest_count=no_vest, no_boots_count=no_boots,
        compliance_rate=compliance, last_violation_time=last_time,
        pending_count=pending_count, approved_count=approved_count, rejected_count=rejected_count,
    )


# ──────────────────────────────────────────────────────────────
# RUNNER
# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.backend:app", host="0.0.0.0", port=8000, reload=True)
