import time
import numpy as np
import pandas as pd
import streamlit as st

from simulator import benign, extraction, snooping
from features import fit_scaler, normalize
from model import build_baseline
from detector import GFluxDetector

st.set_page_config(page_title="G-Flux Monitor", page_icon="🛡️", layout="wide")
st.title("🛡️ G-Flux — GPU Telemetry Threat Detection")

@st.cache_resource
def init():
    with st.spinner("Training baseline on 500 benign samples..."):
        train = [benign() for _ in range(500)]
        scaler = fit_scaler(train)
        X = np.stack([normalize(s, scaler) for s in train])
        model, threshold = build_baseline(X)
    return GFluxDetector(model, threshold, scaler)

det = init()

# ── Sidebar ────────────────────────────────────────────────────────────────
st.sidebar.header("Controls")
mode = st.sidebar.radio("Traffic Mode", ["🟢 Benign", "🔴 Extraction Attack", "🟠 GPU Snooping"])
speed = st.sidebar.slider("Samples per second", 1, 10, 3)
running = st.sidebar.toggle("▶  Start Monitoring", value=False)

if st.sidebar.button("🔄 Reset Detector"):
    det._buf.clear()
    det.alerts.clear()
    st.rerun()

st.sidebar.markdown("---")
st.sidebar.markdown(f"**Threshold:** `{det.threshold:.4f}`")
st.sidebar.markdown(f"**Total Alerts:** `{len(det.alerts)}`")

# ── Layout ─────────────────────────────────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)
metric_gpu    = col1.empty()
metric_l2     = col2.empty()
metric_pcie   = col3.empty()
metric_risk   = col4.empty()

st.markdown("### Risk Score History")
chart_area    = st.empty()

st.markdown("### Live Telemetry")
telemetry_area = st.empty()

st.markdown("### 🚨 Alerts")
alert_area    = st.empty()

# ── Session state for history ───────────────────────────────────────────────
if "history" not in st.session_state:
    st.session_state.history = []
if "telemetry_log" not in st.session_state:
    st.session_state.telemetry_log = []

# ── Main loop ───────────────────────────────────────────────────────────────
sim_fn = {"🟢 Benign": benign, "🔴 Extraction Attack": extraction, "🟠 GPU Snooping": snooping}[mode]

while running:
    raw = sim_fn()
    result = det.ingest(raw)

    st.session_state.history.append(result["risk"])
    if len(st.session_state.history) > 60:
        st.session_state.history = st.session_state.history[-60:]

    st.session_state.telemetry_log.append({
        "time": result["ts"],
        "gpu_util": round(raw["gpu_util"], 1),
        "l2_hit":   round(raw["l2_hit_ratio"], 3),
        "pcie_tx":  round(raw["pcie_tx_gbps"], 2),
        "kernel_entropy": round(raw["kernel_entropy"], 2),
        "risk":     result["risk"],
        "alert":    "🚨" if result["alert"] else "",
    })
    if len(st.session_state.telemetry_log) > 20:
        st.session_state.telemetry_log = st.session_state.telemetry_log[-20:]

    # Metrics
    risk_delta = result["risk"] - (st.session_state.history[-2] if len(st.session_state.history) > 1 else 0)
    metric_gpu.metric("GPU Utilisation",  f"{raw['gpu_util']:.1f}%")
    metric_l2.metric("L2 Cache Hit Ratio", f"{raw['l2_hit_ratio']:.3f}")
    metric_pcie.metric("PCIe TX (Gbps)",   f"{raw['pcie_tx_gbps']:.2f}")
    metric_risk.metric("Risk Score",        f"{result['risk']} / 100", delta=f"{risk_delta:+.1f}")

    # Chart
    chart_area.line_chart(
        pd.DataFrame({"Risk Score": st.session_state.history}),
        use_container_width=True,
        color="#e74c3c",
    )

    # Telemetry table
    telemetry_area.dataframe(
        pd.DataFrame(st.session_state.telemetry_log[::-1]),
        use_container_width=True,
        hide_index=True,
    )

    # Alerts
    if det.alerts:
        alert_df = pd.DataFrame(det.alerts[::-1])
        alert_area.dataframe(alert_df, use_container_width=True, hide_index=True)
    else:
        alert_area.info("No alerts fired yet.")

    time.sleep(1 / speed)
