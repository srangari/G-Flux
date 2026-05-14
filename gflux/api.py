import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import threading
import time as _time
import uvicorn

from simulator import benign, extraction, snooping, timing_side_channel, membership_inference, model_inversion
from detector import GFluxDetector
from model import build_baseline
from features import fit_scaler, to_vector, KEYS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://g-flux-ui.sneharangari9665.workers.dev"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Boot: train on 500 benign samples ──────────────────────────
print("Booting G-Flux detector...")

raw_train        = [benign() for _ in range(500)]
scaler           = fit_scaler(raw_train)          # returns (mean, std) tuple
mean, std        = scaler
X_train          = np.stack([(to_vector(s) - mean) / std for s in raw_train]).astype(np.float32)

model, threshold = build_baseline(X_train)
detector         = GFluxDetector(model, threshold, scaler)
print(f"Detector ready — threshold={threshold:.5f}")

# ── In-memory state ────────────────────────────────────────────
events_log = []
MAX_EVENTS = 200

def _run(sample: dict, attack_type: str):
    result               = detector.ingest(sample)
    if result["risk"] > 84:
        result["risk"] = round(random.uniform(84.0, 93.5), 1)
    result["attack_type"] = attack_type
    
    attack_profiles = {
        "Model Extraction Probe": ("GPU:1 · A100", "GPT-ResNet-v3"),
        "GPU Snooping Attack":    ("GPU:0 · A100", "LLaMA-7B"),
        "Timing Side-Channel":    ("GPU:2 · A100", "BERT-Classifier"),
        "Membership Inference":   ("GPU:1 · A100", "VGG-Encoder"),
        "Model Inversion":        ("GPU:3 · A100", "ResNet-50"),
    }
    gpu, model = attack_profiles.get(attack_type, 
                 ("GPU:0 · A100", "GPT-ResNet-v3"))
    
    result["gpu"] = gpu
    result["model"] = model
    
    if result["flagged"]:
        events_log.append(result)
        if len(events_log) > MAX_EVENTS:
            events_log.pop(0)
    return result

# ══════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════

@app.get("/api/gpu/metrics")
def get_gpu_metrics():
    sample = benign()
    result = _run(sample, "benign")
    return {
        "gpu_util":          round(sample["gpu_util"], 1),
        "power_w":           round(sample["power_w"], 1),
        "temp_c":            round(sample["temp_c"], 1),
        "pcie_tx_gbps":      round(sample["pcie_tx_gbps"], 2),
        "pcie_rx_gbps":      round(sample["pcie_rx_gbps"], 2),
        "kernel_launches_s": round(sample["kernel_launches_s"], 1),
        "kernel_entropy":    round(sample["kernel_entropy"], 3),
        "warp_occupancy":    round(sample["warp_occupancy"], 3),
        "tensor_core_util":  round(sample["tensor_core_util"], 3),
        "l2_hit_ratio":      round(sample["l2_hit_ratio"], 3),
        "rps":               round(sample["rps"], 1),
        "risk":              result["risk"],
        "flagged":           result["flagged"],
        "alert":             result["alert"],
        "ts":                result["ts"],
    }

@app.get("/api/simulate/{attack}")
def simulate_attack(attack: str):
    attack_map = {
        "extraction":  (extraction(),          "Model Extraction Probe"),
        "snooping":    (snooping(),            "GPU Snooping Attack"),
        "timing":      (timing_side_channel(), "Timing Side-Channel"),
        "membership":  (membership_inference(),"Membership Inference"),
        "inversion":   (model_inversion(),     "Model Inversion"),
    }
    sample, label = attack_map.get(attack, (benign(), "benign"))
    result = _run(sample, label)
    return {**{k: round(v, 3) for k, v in sample.items()}, **result}

@app.get("/api/events/active")
def get_active_events():
    return {
        "total":  len(events_log),
        "events": list(reversed(events_log[-50:]))
    }

@app.get("/api/alerts")
def get_alerts():
    confirmed = [e for e in events_log if e.get("alert")]
    return {
        "total":  len(confirmed),
        "alerts": list(reversed(confirmed[-20:]))
    }

@app.get("/api/system/health")
def get_health():
    return {
        "detection_engine": "online",
        "telemetry_ingest": "online",
        "baseline_models":  "ready",
        "threshold":        round(detector.threshold, 5),
        "total_alerts":     len([e for e in events_log if e.get("alert")]),
        "total_flagged":    len(events_log),
    }


def _auto_simulate():
    import random as _random
    attacks = ["extraction","snooping","timing",
               "membership","inversion"]
    while True:
        _time.sleep(4)
        attack = _random.choice(attacks)
        attack_map = {
            "extraction":  (extraction(),          "Model Extraction Probe"),
            "snooping":    (snooping(),            "GPU Snooping Attack"),
            "timing":      (timing_side_channel(), "Timing Side-Channel"),
            "membership":  (membership_inference(),"Membership Inference"),
            "inversion":   (model_inversion(),     "Model Inversion"),
        }
        sample, label = attack_map[attack]
        _run(sample, label)

threading.Thread(target=_auto_simulate, daemon=True).start()

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
