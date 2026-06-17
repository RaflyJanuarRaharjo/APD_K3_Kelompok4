"""
app/dashboard.py – Dashboard Monitoring APD K3 (Integrated AI Camera)
Jalankan: streamlit run app/dashboard.py

Edisi Modernisasi SaaS (Bento Grid & Cinematic Slate Theme)
Kelompok 04 – Universitas Brawijaya 2026
v2.0: Role-Based Access Control (Supervisor / Admin)
"""

import os
import sys
import json
import datetime
import time
from pathlib import Path

import requests
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import cv2
import psutil

sys.path.insert(0, str(Path(__file__).parent.parent))
from ultralytics import YOLO
from utils.violation_handler import ViolationHandler
from utils.notifier import send_notification
from utils.ai_integration_client import K3IntegrationClient

client = K3IntegrationClient()

# ──────────────────────────────────────────────────────────────
# CONFIGURATION MANIFEST
# ──────────────────────────────────────────────────────────────
CAPTURE_DIR   = os.getenv("CAPTURE_DIR", "captures")
CLASS_NAMES   = ['boots', 'helmet', 'no boots', 'no helmet', 'no vest', 'person', 'vest']
VIOLATION_CLS = ["no helmet", "no vest", "no boots"]
APD_LABELS    = {
    "no helmet" : "Tanpa Helm",
    "no vest"   : "Tanpa Rompi",
    "no boots"  : "Tanpa Sepatu",
}
BACKEND_URL   = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

COLORS = {
    'boots'     : (34, 197, 94),
    'helmet'    : (34, 197, 94),
    'vest'      : (34, 197, 94),
    'no boots'  : (239, 68, 68),
    'no helmet' : (239, 68, 68),
    'no vest'   : (239, 68, 68),
    'person'    : (249, 115, 22),
}

st.set_page_config(
    page_title = "K3In APD Monitor PRO",
    page_icon  = "🦺",
    layout     = "wide",
)

# ──────────────────────────────────────────────────────────────
# CSS INJECTION
# ──────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .stApp { background: #09090b !important; color: #f4f4f5 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; }
    .block-container { padding-top: 1.5rem !important; padding-bottom: 2rem !important; padding-left: 2rem !important; padding-right: 2rem !important; max-width: 100%; }

    .header-banner {
        background: rgba(24, 24, 27, 0.7);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 20px 28px;
        border-radius: 20px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .bento-card {
        background: rgba(24, 24, 27, 0.6);
        backdrop-filter: blur(16px);
        border-radius: 20px;
        padding: 24px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        margin-bottom: 16px;
    }
    .bento-card:hover { transform: translateY(-2px); border-color: rgba(229, 9, 20, 0.3); }
    .k3-card-title { font-size: 12px; color: #a1a1aa; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .k3-card-value { font-size: 36px; font-weight: 800; color: #ffffff; margin-top: 4px; }

    .stTabs [data-baseweb="tab-list"] { gap: 10px; }
    .stTabs [data-baseweb="tab"] { background-color: rgba(39, 39, 42, 0.5); border-radius: 12px; color: #a1a1aa; font-weight: 600; padding: 10px 20px; border: 1px solid rgba(255,255,255,0.03); transition: 0.2s; }
    .stTabs [aria-selected="true"] { background-color: #E50914 !important; color: #ffffff !important; border-color: #E50914 !important; box-shadow: 0 0 15px rgba(229,9,20,0.3); }

    .stButton > button { background: rgba(39, 39, 42, 0.6) !important; color: white !important; border-radius: 12px !important; border: 1px solid rgba(255, 255, 255, 0.08) !important; min-height: 44px !important; font-weight: 600 !important; transition: 0.2s; text-align: left; padding-left: 16px; }
    .stButton > button:hover { background: #E50914 !important; border-color: #E50914 !important; box-shadow: 0 0 20px rgba(229, 9, 20, 0.35) !important; transform: translateY(-1px); }
    [data-testid="stSidebar"] { background: #09090b !important; border-right: 1px solid rgba(255,255,255,0.06) !important; }
    [data-testid="stDataFrame"] { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }

    .badge { display: inline-block; padding: 4px 10px; font-size: 10px; font-weight: 700; border-radius: 50px; margin-right: 6px; text-transform: uppercase; }
    .badge-viol    { background-color: rgba(239, 68, 68, 0.1);  color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
    .badge-pending  { background-color: rgba(250, 204, 21, 0.1); color: #facc15; border: 1px solid rgba(250,204,21,0.2); }
    .badge-approved { background-color: rgba(34, 197, 94, 0.1);  color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
    .badge-rejected { background-color: rgba(148, 163, 184, 0.1);color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }

    .role-badge-supervisor { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; }
    .role-badge-admin { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; }

    .login-box { max-width: 420px; margin: 80px auto; padding: 40px; background: #121214; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

    .validation-card { background: rgba(30,30,34,0.8); border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.07); margin-bottom: 12px; }
    .responsive-video-frame { border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
</style>
""", unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────
# MULTI-ROLE LOGIN SCREEN
# ──────────────────────────────────────────────────────────────
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
    st.session_state.role          = None
    st.session_state.username      = None

if not st.session_state.authenticated:
    st.markdown("""
    <style>
        [data-testid="stSidebar"] { display: none; }
        .block-container { max-width: 1180px !important; padding-top: 5rem !important; padding-left: 2rem !important; padding-right: 2rem !important; }
        .login-hero-card { min-height: 430px; padding: 42px; border-radius: 28px; background: radial-gradient(circle at top left, rgba(229,9,20,0.22), transparent 34%), linear-gradient(180deg, rgba(24,24,27,0.92), rgba(10,10,12,0.96)); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 30px 90px rgba(0,0,0,0.45); display: flex; flex-direction: column; justify-content: space-between; }
        .login-brand-badge { display: inline-flex; align-items: center; gap: 8px; width: fit-content; padding: 8px 14px; border-radius: 999px; background: rgba(34,197,94,0.10); color: #4ade80; border: 1px solid rgba(34,197,94,0.22); font-size: 12px; font-weight: 800; margin-bottom: 28px; }
        .login-hero-title { font-size: 46px; line-height: 1.05; font-weight: 900; color: #ffffff; letter-spacing: -1.5px; margin-bottom: 16px; }
        .login-hero-text { font-size: 15px; line-height: 1.8; color: #a1a1aa; max-width: 430px; }
        .login-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 34px; }
        .login-feature-item { padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); color: #e4e4e7; font-size: 12px; font-weight: 700; text-align: center; }
        .login-form-shell { min-height: 430px; padding: 42px 36px; border-radius: 28px; background: rgba(24,24,27,0.78); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 30px 90px rgba(0,0,0,0.38); }
        .login-form-title { color: #ffffff; font-size: 30px; font-weight: 900; margin-bottom: 8px; }
        .login-form-subtitle { color: #a1a1aa; font-size: 14px; margin-bottom: 26px; }
        .stTextInput label { color: #d4d4d8 !important; font-weight: 700 !important; font-size: 13px !important; }
        .stTextInput > div > div > input { background: #f8fafc !important; color: #0f172a !important; border-radius: 14px !important; border: 1px solid rgba(255,255,255,0.12) !important; height: 48px !important; font-weight: 600 !important; }
        .stFormSubmitButton > button { background: linear-gradient(135deg, #ef4444, #f97316) !important; color: #ffffff !important; border: none !important; border-radius: 14px !important; height: 50px !important; font-weight: 900 !important; text-align: center !important; justify-content: center !important; box-shadow: 0 16px 35px rgba(239,68,68,0.22) !important; }
        .login-footnote { margin-top: 18px; color: #71717a; font-size: 12px; text-align: center; }
    </style>
    """, unsafe_allow_html=True)

    left_col, right_col = st.columns([1.15, 0.85], gap="large")

    with left_col:
        st.markdown("""
        <div class="login-hero-card">
            <div>
                <div class="login-brand-badge">🟢 CORE AI READY</div>
                <div class="login-hero-title">K3In APD<br/>Control Hub</div>
                <div class="login-hero-text">
                    Dashboard monitoring kepatuhan APD berbasis AI untuk mendeteksi pelanggaran helm,
                    rompi, dan sepatu safety secara real-time.
                </div>
                <div class="login-feature-grid">
                    <div class="login-feature-item">🎥 Live Camera</div>
                    <div class="login-feature-item">📊 Analytics</div>
                    <div class="login-feature-item">✅ Validation</div>
                </div>
            </div>
            <div style="color:#52525b;font-size:12px;font-weight:700;">Kelompok 04 • Universitas Brawijaya 2026</div>
        </div>
        """, unsafe_allow_html=True)

    with right_col:
        st.markdown("""
        <div class="login-form-shell">
            <div class="login-form-title">Welcome Back</div>
            <div class="login-form-subtitle">Masuk untuk mengakses panel monitoring K3.</div>
        """, unsafe_allow_html=True)

        with st.form("login_form"):
            uname = st.text_input("Username", placeholder="supervisor / admin")
            pwd = st.text_input("Password", type="password", placeholder="••••••••")
            submit = st.form_submit_button("Masuk Ke Control Panel", use_container_width=True)

            if submit:
                try:
                    resp = requests.post(
                        f"{BACKEND_URL}/api/v1/auth/login",
                        json={"username": uname, "password": pwd},
                        timeout=5,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        st.session_state.authenticated = True
                        st.session_state.role = data["role"]
                        st.session_state.username = data["username"]
                        st.rerun()
                    else:
                        st.error("Akses ditolak! Username atau password salah.")
                except Exception as e:
                    st.error(f"Tidak dapat menghubungi backend: {e}")

        st.markdown("""
            <div class="login-footnote">Gunakan akun Supervisor atau Admin yang terdaftar.</div>
        </div>
        """, unsafe_allow_html=True)

    st.stop()

# ──────────────────────────────────────────────────────────────
# HELPER: panggil API dengan credential header
# ──────────────────────────────────────────────────────────────
def api_headers_auth():
    """Header untuk endpoint yang butuh X-Username + X-Password (Supervisor)."""
    return {
        "X-Username": st.session_state.username,
        "X-Password": _get_password_for_session(),
    }


def _get_password_for_session():
    """Ambil password dari env sesuai role (disimpan hanya untuk session ini)."""
    if st.session_state.role == "supervisor":
        return os.getenv("SUPERVISOR_PASS", "supervisor123")
    return os.getenv("ADMIN_PASS", "admin123")


@st.cache_data(ttl=5)
def load_violations(status_filter: str = None):
    try:
        url = f"{BACKEND_URL}/api/v1/violations?limit=200"
        if status_filter:
            url += f"&status={status_filter}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if not data:
                return pd.DataFrame()
            df = pd.DataFrame(data)
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df["date"]      = df["timestamp"].dt.date
            df["hour"]      = df["timestamp"].dt.hour
            return df
    except Exception as e:
        st.sidebar.error(f"⚠️ Gagal sinkronisasi API: {e}")
    return pd.DataFrame()


# ──────────────────────────────────────────────────────────────
# HEADER BANNER
# ──────────────────────────────────────────────────────────────
role_label = "SUPERVISOR" if st.session_state.role == "supervisor" else "ADMIN"
role_color = "#7c3aed" if st.session_state.role == "supervisor" else "#1d4ed8"
role_icon  = "👑" if st.session_state.role == "supervisor" else "🔵"

st.markdown(f"""
<div class="header-banner">
    <div>
        <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">K3<span style="color:#E50914;">In</span> APD Control Hub</h1>
        <p style="color: #a1a1aa; margin: 4px 0 0 0; font-size: 13px;">PT Indonesia Epson Industry | Monitoring Kepatuhan Real-Time</p>
    </div>
    <div style="display:flex; align-items:center; gap:12px;">
        <div style="background: rgba(16,185,129,0.1); color:#34d399; border:1px solid rgba(16,185,129,0.2); padding:6px 16px; border-radius:50px; font-size:11px; font-weight:700;">🟢 CORE AI READY</div>
        <div style="background: rgba(124,58,237,0.15); color:#a78bfa; border:1px solid rgba(124,58,237,0.25); padding:6px 16px; border-radius:50px; font-size:11px; font-weight:700;">{role_icon} {role_label}: {st.session_state.username}</div>
    </div>
</div>
""", unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────
# SESSION STATE INIT
# ──────────────────────────────────────────────────────────────
if "current_page" not in st.session_state:
    st.session_state.current_page = "Dashboard Utama"

if "date_range" not in st.session_state:
    st.session_state.date_range = (
        datetime.date.today() - datetime.timedelta(days=7),
        datetime.date.today()
    )
date_range = st.session_state.date_range


# ──────────────────────────────────────────────────────────────
# LIVE CAMERA STATE
# ──────────────────────────────────────────────────────────────
if "run_live_camera" not in st.session_state:
    st.session_state.run_live_camera = False

run_live_camera = st.session_state.run_live_camera

# ──────────────────────────────────────────────────────────────
# SIDEBAR
# ──────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown('<div style="padding:10px 4px 20px 4px;"><h3 style="color:#a1a1aa; font-size:12px; font-weight:700; letter-spacing:1px;">WORKSPACE MENU</h3></div>', unsafe_allow_html=True)

    pages = ["Dashboard Utama", "Live Camera", "Riwayat Pelanggaran"]
    if st.session_state.role == "supervisor":
        pages.append("Antrian Validasi")

    for page in pages:
        icon_map = {
            "Dashboard Utama"      : "📊",
            "Live Camera"          : "🎥",
            "Riwayat Pelanggaran"  : "📋",
            "Antrian Validasi"     : "✅",
        }
        is_active = st.session_state.current_page == page
        btn_type  = "primary" if is_active else "secondary"
        if st.button(f"{icon_map[page]}   {page}", type=btn_type, use_container_width=True):
            st.session_state.current_page = page
            st.rerun()

    st.divider()
    st.markdown('<h4 style="color:#a1a1aa; font-size:12px; font-weight:700;">⚙️ AI CAMERA PARAMETER</h4>', unsafe_allow_html=True)
    st.caption("Kamera dipindahkan ke halaman Live Camera.")
    conf_threshold  = st.slider("Confidence Threshold", 0.0, 1.0, 0.60)

    st.divider()
    st.markdown('<h4 style="color:#a1a1aa; font-size:12px; font-weight:700;">🔍 FILTER DATA LOG</h4>', unsafe_allow_html=True)
    auto_refresh = st.toggle("Auto Refresh UI (5s)", value=True if not run_live_camera else False)
    date_range   = st.date_input("Rentang Tanggal", value=date_range)
    viol_filter  = st.multiselect("Komponen Pelanggaran", options=VIOLATION_CLS, default=VIOLATION_CLS, format_func=lambda x: APD_LABELS.get(x, x))

    st.divider()
    if st.button("🚪  Logout", use_container_width=True):
        for key in ["authenticated", "role", "username", "current_page"]:
            st.session_state.pop(key, None)
        st.rerun()

    st.markdown("<br><br><div style='text-align:center; color:#52525b; font-size:11px; font-weight:600;'>Kelompok 04 • UB 2026</div>", unsafe_allow_html=True)


# ──────────────────────────────────────────────────────────────
# DATA LAYER
# ──────────────────────────────────────────────────────────────
df_all = load_violations()

if df_all.empty:
    df = pd.DataFrame()
else:
    if len(date_range) == 2:
        start, end = date_range
        df = df_all[(df_all["date"] >= start) & (df_all["date"] <= end)].copy()
    else:
        df = df_all.copy()

    if viol_filter and not df.empty:
        mask = df["violations"].apply(lambda v: any(vt in viol_filter for vt in v) if isinstance(v, list) else False)
        df = df[mask]


# ──────────────────────────────────────────────────────────────
# OVERLAY DRAW
# ──────────────────────────────────────────────────────────────
def draw_overlay_live(frame, detections, fps, cpu_usage):
    status_text = f"FPS: {fps:.1f} | CPU: {cpu_usage}% | Total Objek: {len(detections)}"
    cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    if len(detections) == 0:
        cv2.putText(frame, "STATUS: AI BLIND (NO OBJECTS)", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
    for det in detections:
        cls_name = det["class"]
        if cls_name == "person": continue
        x1, y1, x2, y2 = det["bbox"]
        conf    = det["conf"]
        color   = COLORS.get(cls_name, (200, 200, 200))
        is_viol = cls_name in VIOLATION_CLS
        thickness = 3 if is_viol else 2
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
        label = f"{cls_name} {conf:.2f}"
        (lw, lh), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x1, y1 - lh - 6), (x1 + lw, y1), color, -1)
        cv2.putText(frame, label, (x1, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        if is_viol:
            cv2.putText(frame, "CRITICAL ERROR", (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
    return frame


@st.cache_resource
def load_yolo_model():
    model = YOLO("best.pt")
    model.fuse()
    return model


# ══════════════════════════════════════════════════════════════
# PAGE: DASHBOARD UTAMA
# ══════════════════════════════════════════════════════════════
if st.session_state.current_page == "Dashboard Utama":

    if df_all.empty:
        st.warning("⚠️ Belum ada data log. Aktifkan kamera di sidebar untuk memicu log data baru!")
        st.stop()

    # KPI CARDS
    today_date = datetime.date.today()
    df_today = df[df["date"] == today_date].copy() if not df.empty else pd.DataFrame()

    today_viol = len(df_today)
    helm_cnt = df_today["violations"].apply(lambda v: "no helmet" in v if isinstance(v, list) else False).sum() if not df_today.empty else 0
    vest_cnt = df_today["violations"].apply(lambda v: "no vest" in v if isinstance(v, list) else False).sum() if not df_today.empty else 0
    boots_cnt = df_today["violations"].apply(lambda v: "no boots" in v if isinstance(v, list) else False).sum() if not df_today.empty else 0

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="bento-card">
            <div class="k3-card-title">📅 Pelanggaran Hari Ini</div>
            <div class="k3-card-value" style="color:#fb7185;">{today_viol}</div>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
        <div class="bento-card">
            <div class="k3-card-title">🦺 Tanpa Rompi</div>
            <div class="k3-card-value" style="color:#f97316;">{int(vest_cnt)}</div>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
        <div class="bento-card">
            <div class="k3-card-title">⛑️ Tanpa Helm</div>
            <div class="k3-card-value" style="color:#facc15;">{int(helm_cnt)}</div>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="bento-card">
            <div class="k3-card-title">🥾 Tanpa Shoes</div>
            <div class="k3-card-value" style="color:#38bdf8;">{int(boots_cnt)}</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    tab1, tab2, tab3 = st.tabs(["📊 Tren Analitik", "🧩 Proporsi Komponen", "🖼️ Galeri Bukti Visual"])

    with tab1:
        if not df.empty:
            daily = df.groupby("date").size().reset_index(name="jumlah")
            chart_col1, chart_col2 = st.columns(2)
            with chart_col1:
                with st.container(border=True):
                    fig = px.bar(daily, x="date", y="jumlah", color="jumlah", color_continuous_scale="Reds")
                    fig.update_layout(showlegend=False, coloraxis_showscale=False, height=340, margin=dict(l=15,r=15,t=45,b=15), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font=dict(color="#a1a1aa"), title=dict(text="Pelanggaran Per Hari", font=dict(size=15, color="#ffffff")))
                    st.plotly_chart(fig, use_container_width=True)
            with chart_col2:
                with st.container(border=True):
                    hourly = df.groupby("hour").size().reset_index(name="jumlah")
                    fig2 = px.line(hourly, x="hour", y="jumlah", markers=True)
                    fig2.update_traces(line_color="#E50914", marker=dict(size=6))
                    fig2.update_layout(height=340, margin=dict(l=15,r=15,t=45,b=15), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font=dict(color="#a1a1aa"), title=dict(text="Frekuensi Kasus per Jam", font=dict(size=15, color="#ffffff")))
                    st.plotly_chart(fig2, use_container_width=True)
        else:
            st.info("Tidak ada data tren untuk rentang tanggal ini.")

    with tab2:
        with st.container(border=True):
            counts = {"Tanpa Helm": int(helm_cnt), "Tanpa Rompi": int(vest_cnt), "Tanpa Sepatu": int(boots_cnt)}
            pie_df = pd.DataFrame(list(counts.items()), columns=["APD", "Jumlah"])
            pie_df = pie_df[pie_df["Jumlah"] > 0]
            if not pie_df.empty:
                fig = px.pie(pie_df, names="APD", values="Jumlah", hole=0.45, color_discrete_sequence=["#E50914","#f97316","#eab308"])
                fig.update_layout(height=340, margin=dict(l=15,r=15,t=45,b=15), paper_bgcolor="rgba(0,0,0,0)", font=dict(color="#a1a1aa"), title=dict(text="Proporsi Komponen Pelanggaran APD K3", font=dict(size=15, color="#ffffff")))
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("Belum ada sebaran klasifikasi komponen.")

    with tab3:
        st.markdown("<div style='padding:10px 0 15px 0;'><h4 style='margin:0; font-size:16px;'>Bukti Dokumen Lapangan</h4></div>", unsafe_allow_html=True)
        if not df.empty:
            recent = df.tail(12).iloc[::-1]
            cols   = st.columns(3)
            for idx, (_, row) in enumerate(recent.iterrows()):
                col_target = cols[idx % 3]
                img_path   = row.get("image_path", "")
                viol_list  = row["violations"]
                ts_str     = row["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
                status_val = row.get("status", "pending")
                status_badge = f'<span class="badge badge-{status_val}">{status_val.upper()}</span>'
                with col_target:
                    with st.container(border=True):
                        if img_path and Path(img_path).exists():
                            st.image(img_path, use_container_width=True)
                        else:
                            st.markdown('<div style="background:rgba(39,39,42,0.4);height:160px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px dashed rgba(255,255,255,0.08);margin-bottom:10px;"><span style="color:#71717a;font-size:13px;">📷 Snapshot Hilang</span></div>', unsafe_allow_html=True)
                        badges = "".join([f'<span class="badge badge-viol">{APD_LABELS.get(v,v)}</span>' for v in viol_list])
                        st.markdown(f"""
                        <div style="padding-top:4px;">
                            <div style="font-size:13px;font-weight:700;color:#ffffff;margin-bottom:4px;">🕒 {ts_str}</div>
                            <div style="margin:6px 0 4px 0;">{badges}</div>
                            <div style="margin-bottom:6px;">{status_badge}</div>
                            <div style="font-size:11px;color:#a1a1aa;font-weight:600;">Akurasi: <span style="color:#f87171;">{row.get("confidence",0.0)*100:.1f}%</span></div>
                        </div>""", unsafe_allow_html=True)
        else:
            st.info("Belum ada rekaman arsip bukti visual.")


elif st.session_state.current_page == "Live Camera":
    st.markdown("<div style='padding:10px 0 8px 0;'><h3 style='margin:0; font-size:20px;'>🎥 Live Camera Monitoring</h3></div>", unsafe_allow_html=True)
    st.markdown("<p style='color:#a1a1aa; font-size:13px; margin-bottom:20px;'>Aktifkan kamera untuk mendeteksi kepatuhan APD secara real-time.</p>", unsafe_allow_html=True)

    control_col1, control_col2, status_col = st.columns([2, 2, 4])

    with control_col1:
        if st.button("▶️ Start Camera", use_container_width=True):
            st.session_state.run_live_camera = True
            st.rerun()

    with control_col2:
        if st.button("⏹️ Stop Camera", use_container_width=True):
            st.session_state.run_live_camera = False
            st.rerun()

    with status_col:
        if st.session_state.run_live_camera:
            st.success("Kamera aktif. Sistem sedang melakukan monitoring APD.")
        else:
            st.info("Kamera belum aktif. Tekan Start Camera untuk memulai monitoring.")

    if not st.session_state.run_live_camera:
        st.markdown("""
        <div class="bento-card" style="text-align:center; padding:42px; margin-top:18px;">
            <div style="font-size:44px; margin-bottom:10px;">🎥</div>
            <h3 style="color:#ffffff; margin-bottom:8px;">Live Camera Standby</h3>
            <p style="color:#a1a1aa; margin:0;">Tekan tombol Start Camera untuk mengaktifkan deteksi APD secara real-time.</p>
        </div>
        """, unsafe_allow_html=True)
        st.stop()

    col_cam_frame, col_cam_telemetry = st.columns([7, 3])

    with col_cam_telemetry:
        st.markdown("<div class='bento-card'><h4>⚙️ Stream Metrics</h4><hr style='margin:10px 0; border-color:rgba(255,255,255,0.05);'></div>", unsafe_allow_html=True)
        fps_metric = st.metric("Inference Speed", "0.0 FPS")
        cpu_metric = st.metric("AI Core Load", "0.0%")
        st.caption("🟢 Webcam aktif beroperasi.")

    with col_cam_frame:
        st.markdown("<div class='responsive-video-frame'>", unsafe_allow_html=True)
        frame_placeholder = st.empty()
        st.markdown("</div>", unsafe_allow_html=True)

    os.makedirs(CAPTURE_DIR, exist_ok=True)
    model_ai = load_yolo_model()
    handler = ViolationHandler(capture_dir=CAPTURE_DIR)

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 15)

    fps_calc = 0.0
    prev_time = time.time()
    last_sent_time = 0.0
    cooldown_delay = 4.0

    while cap.isOpened() and st.session_state.run_live_camera:
        ret, frame = cap.read()

        if not ret:
            st.warning("Frame kamera gagal dibaca. Mencoba ulang...")
            time.sleep(0.1)
            continue

        results = model_ai.predict(
            source=frame,
            conf=conf_threshold,
            iou=0.45,
            imgsz=320,
            verbose=False
        )[0]

        detections = []
        has_new_violation = False
        current_timestamp = time.time()

        if results.boxes is not None:
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                cls_name = CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else "unknown"
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "class": cls_name,
                    "conf": conf,
                    "bbox": (x1, y1, x2, y2),
                    "track_id": None
                })

                if cls_name in VIOLATION_CLS and (current_timestamp - last_sent_time > cooldown_delay):
                    has_new_violation = True

        cpu_perc = psutil.cpu_percent()
        curr_time = time.time()
        fps_calc = 0.9 * fps_calc + 0.1 * (1.0 / max(curr_time - prev_time, 1e-6))
        prev_time = curr_time

        fps_metric.metric("Inference Speed", f"{fps_calc:.1f} FPS")
        cpu_metric.metric("AI Core Load", f"{cpu_perc}%")

        annotated_frame = draw_overlay_live(frame.copy(), detections, fps_calc, cpu_perc)

        if has_new_violation:
            viol_types = [d["class"] for d in detections if d["class"] in VIOLATION_CLS]

            if viol_types:
                conf_max = max([d["conf"] for d in detections if d["class"] in VIOLATION_CLS])
                last_sent_time = current_timestamp
                capture_path = handler.capture_only(annotated_frame)
                unique_viol = list(set(viol_types))

                res = client.send_violation(
                    violation_types=unique_viol,
                    confidence=conf_max,
                    image_path=capture_path or "",
                    area="Area Kontrol Utama",
                    camera="Kamera Live Camera Page"
                )

                if res:
                    send_notification(unique_viol, capture_path)
                    st.toast(
                        f"🚨 Pelanggaran terdeteksi! Menunggu validasi Supervisor. ID: {res.get('id')}",
                        icon="🔥"
                    )

        frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
        frame_placeholder.image(frame_rgb, channels="RGB", use_container_width=True)

        time.sleep(0.05)

    cap.release()
    st.session_state.run_live_camera = False
    st.rerun()


# ══════════════════════════════════════════════════════════════
# PAGE: RIWAYAT PELANGGARAN (Admin & Supervisor)
# ══════════════════════════════════════════════════════════════
elif st.session_state.current_page == "Riwayat Pelanggaran":
    st.markdown("<div style='padding:10px 0 15px 0;'><h3 style='margin:0; font-size:20px;'>📋 Log Riwayat Pelanggaran Lengkap</h3></div>", unsafe_allow_html=True)

    if not df.empty:
        with st.container(border=True):
            display_df = df[["timestamp", "violations", "status", "validated_by", "validated_at", "image_path"]].copy()
            display_df["timestamp"]    = display_df["timestamp"].dt.strftime("%Y-%m-%d %H:%M:%S")
            display_df["violations"]   = display_df["violations"].apply(lambda v: ", ".join([APD_LABELS.get(vt, vt) for vt in v]) if isinstance(v, list) else str(v))
            display_df["status"]       = display_df["status"].fillna("pending")
            display_df["validated_by"] = display_df["validated_by"].fillna("-")
            display_df["validated_at"] = display_df["validated_at"].fillna("-")
            display_df = display_df.rename(columns={
                "timestamp"    : "Waktu Kejadian",
                "violations"   : "Komponen Pelanggaran",
                "status"       : "Status Validasi",
                "validated_by" : "Divalidasi Oleh",
                "validated_at" : "Waktu Validasi",
                "image_path"   : "File Snapshot",
            })
            st.dataframe(display_df.iloc[::-1].reset_index(drop=True), use_container_width=True, height=450)
            st.markdown("<br>", unsafe_allow_html=True)
            csv = display_df.to_csv(index=False).encode("utf-8")
            st.download_button(label="📥 Unduh CSV Laporan Lengkap", data=csv, file_name=f"laporan_k3_ub_{datetime.date.today()}.csv", mime="text/csv", use_container_width=True)
    else:
        st.info("Tidak ada data log yang terfilter.")


# ══════════════════════════════════════════════════════════════
# PAGE: ANTRIAN VALIDASI (Supervisor only)
# ══════════════════════════════════════════════════════════════
elif st.session_state.current_page == "Antrian Validasi":
    if st.session_state.role != "supervisor":
        st.error("⛔ Akses ditolak. Halaman ini hanya untuk Supervisor.")
        st.stop()

    st.markdown("<div style='padding:10px 0 8px 0;'><h3 style='margin:0; font-size:20px;'>✅ Antrian Validasi Pelanggaran</h3></div>", unsafe_allow_html=True)
    st.markdown("<p style='color:#a1a1aa; font-size:13px; margin-bottom:20px;'>Tinjau setiap pelanggaran yang terdeteksi sistem, lalu approve atau reject.</p>", unsafe_allow_html=True)

    # Load khusus pending
    df_pending = load_violations(status_filter="pending")

    if df_pending.empty:
        st.success("🎉 Tidak ada pelanggaran yang menunggu validasi saat ini.")
    else:
        pending_count = len(df_pending)
        st.markdown(f"""
        <div class="bento-card" style="border-color:rgba(250,204,21,0.3);">
            <div class="k3-card-title">⏳ Total Antrian</div>
            <div class="k3-card-value" style="color:#facc15;">{pending_count}</div>
        </div>
        """, unsafe_allow_html=True)

        # ── Validasi Massal ────────────────────────────────────
        with st.expander("⚡ Validasi Massal Semua Antrian"):
            col_bulk1, col_bulk2 = st.columns(2)
            bulk_notes = st.text_input("Catatan massal (opsional)")
            with col_bulk1:
                if st.button("✅ Approve Semua", use_container_width=True):
                    all_ids = df_pending["id"].tolist()
                    try:
                        resp = requests.patch(
                            f"{BACKEND_URL}/api/v1/violations/bulk/validate",
                            json={"ids": all_ids, "action": "approve", "notes": bulk_notes or None},
                            headers=api_headers_auth(), timeout=10,
                        )
                        if resp.status_code == 200:
                            st.success(f"✅ {resp.json()['updated']} pelanggaran di-approve.")
                            st.cache_data.clear()
                            st.rerun()
                        else:
                            st.error(f"Gagal: {resp.text}")
                    except Exception as e:
                        st.error(f"Error: {e}")
            with col_bulk2:
                if st.button("❌ Reject Semua", use_container_width=True):
                    all_ids = df_pending["id"].tolist()
                    try:
                        resp = requests.patch(
                            f"{BACKEND_URL}/api/v1/violations/bulk/validate",
                            json={"ids": all_ids, "action": "reject", "notes": bulk_notes or None},
                            headers=api_headers_auth(), timeout=10,
                        )
                        if resp.status_code == 200:
                            st.success(f"❌ {resp.json()['updated']} pelanggaran di-reject.")
                            st.cache_data.clear()
                            st.rerun()
                        else:
                            st.error(f"Gagal: {resp.text}")
                    except Exception as e:
                        st.error(f"Error: {e}")

        st.markdown("<br>", unsafe_allow_html=True)

        # ── Validasi Per Item ──────────────────────────────────
        for idx, row in df_pending.iterrows():
            vid       = row["id"]
            ts_str    = row["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
            viol_list = row["violations"] if isinstance(row["violations"], list) else [row["violations"]]
            img_path  = row.get("image_path", "")
            conf_val  = row.get("confidence", 0.0) or 0.0

            with st.container(border=True):
                img_col, info_col, action_col = st.columns([3, 4, 3])

                with img_col:
                    if img_path and Path(img_path).exists():
                        st.image(img_path, use_container_width=True)
                    else:
                        st.markdown('<div style="background:rgba(39,39,42,0.4);height:140px;display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px dashed rgba(255,255,255,0.08);"><span style="color:#71717a;font-size:13px;">📷 No Image</span></div>', unsafe_allow_html=True)

                with info_col:
                    st.markdown(f"**🕒 Waktu:** `{ts_str}`")
                    st.markdown(f"**📍 Area:** {row.get('area','–')}  |  **📷 Kamera:** {row.get('camera','–')}")
                    st.markdown(f"**🎯 Confidence:** `{conf_val*100:.1f}%`")
                    badges = "".join([f'<span class="badge badge-viol">{APD_LABELS.get(v,v)}</span>' for v in viol_list])
                    st.markdown(f"**Pelanggaran:** {badges}", unsafe_allow_html=True)
                    st.markdown(f'<span class="badge badge-pending">PENDING</span>', unsafe_allow_html=True)

                with action_col:
                    notes_key = f"notes_{vid}"
                    notes_val = st.text_input("Catatan", key=notes_key, placeholder="Opsional…")

                    approve_key = f"approve_{vid}"
                    reject_key  = f"reject_{vid}"

                    if st.button("✅ Approve", key=approve_key, use_container_width=True):
                        try:
                            resp = requests.patch(
                                f"{BACKEND_URL}/api/v1/violations/{vid}/validate",
                                json={"action": "approve", "notes": notes_val or None},
                                headers=api_headers_auth(), timeout=10,
                            )
                            if resp.status_code == 200:
                                st.success("Disetujui ✅")
                                st.cache_data.clear()
                                st.rerun()
                            else:
                                st.error(f"Gagal: {resp.text}")
                        except Exception as e:
                            st.error(f"Error: {e}")

                    if st.button("❌ Reject", key=reject_key, use_container_width=True):
                        try:
                            resp = requests.patch(
                                f"{BACKEND_URL}/api/v1/violations/{vid}/validate",
                                json={"action": "reject", "notes": notes_val or None},
                                headers=api_headers_auth(), timeout=10,
                            )
                            if resp.status_code == 200:
                                st.warning("Ditolak ❌")
                                st.cache_data.clear()
                                st.rerun()
                            else:
                                st.error(f"Gagal: {resp.text}")
                        except Exception as e:
                            st.error(f"Error: {e}")


# ──────────────────────────────────────────────────────────────
# AUTO REFRESH
# ──────────────────────────────────────────────────────────────
if auto_refresh and not run_live_camera:
    time.sleep(5)
    st.rerun()
