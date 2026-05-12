# G-Flux — GPU Security Monitoring Platform

G-Flux is a real-time GPU telemetry-driven detection framework 
that protects machine learning models from adversarial attacks. 
It monitors low-level hardware execution patterns and detects 
suspicious activity using an autoencoder-based anomaly detection 
engine.

---

## What it does

**Input:**
- Raw GPU telemetry sampled every few seconds:
  - GPU utilization %
  - Power draw (watts)
  - Temperature (°C)
  - PCIe TX/RX throughput (GB/s)
  - Kernel launch rate (launches/sec)
  - Kernel entropy
  - Warp occupancy
  - Tensor core utilization
  - L2 cache hit ratio
  - FP16/FP32 compute fractions
  - Requests per second
  - Inter-arrival coefficient of variation
  - Batch size

**Output:**
- Real-time anomaly score (0–100 risk score)
- Attack classification (5 attack types)
- Flagged events with timestamps
- Email alerts via Outlook when risk > 70
- Interactive dashboard showing live detections

---

## Detected Attack Types

| Attack | Description | Avg Detection Time |
|--------|-------------|-------------------|
| Model Extraction Probe | Systematic inference queries to reconstruct model weights | 4.2 min |
| GPU Snooping Attack | Co-tenant spy process reading GPU memory via PCIe | 3.1 min |
| Timing Side-Channel | Exploits inference latency to infer model architecture | 8.3 min |
| Membership Inference | Probes if specific data was used in training | 11.7 min |
| Model Inversion | Reconstructs training data from model predictions | 6.1 min |

---

## How it works
GPU Servers (NVML telemetry)
↓ 15 metrics per sample
Autoencoder (model.py)
↓ reconstruction error vs threshold
Detector (detector.py)
↓ risk score + attack classification
FastAPI (api.py) — port 8000
↓ REST endpoints
React Dashboard (gflux-ui/) — port 8080
↓ risk > 70
Outlook Email Alert

### Detection logic
- Trains an autoencoder on 500 benign GPU samples at startup
- Sets anomaly threshold at the 97th percentile of training errors
- Flags samples where reconstruction error exceeds threshold
- Confirms alert after 3 consecutive flagged samples
- Risk score = min(100, (error / threshold) × 50)
- False positive rate: 0% | Detection rate: 98%

---

## Project structure

G-Flux/
├── gflux/                  # Python backend
│   ├── model.py            # Autoencoder neural network
│   ├── detector.py         # Anomaly detection engine
│   ├── simulator.py        # Attack traffic simulator
│   ├── features.py         # Feature extraction + normalization
│   ├── demo.py             # Standalone demo script
│   └── api.py              # FastAPI REST API
│
└── gflux-ui/               # React frontend
└── src/
└── routes/
├── dashboard.tsx              # Main dashboard
├── security.events.$id.tsx    # Attack detail page
├── security.attack-types.tsx  # Attack reference
└── mitigation.tsx             # Response plans

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

---

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/YOURUSERNAME/g-flux.git
cd g-flux
```

### 2. Set up Python backend
```bash
cd gflux
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn scikit-learn numpy python-dotenv
```

### 3. Configure environment (optional — for email alerts)
Create a `.env` file inside the `gflux/` folder:
ALERT_EMAIL_FROM=your.email@outlook.com
ALERT_EMAIL_TO=your.email@outlook.com
ALERT_EMAIL_PASSWORD=your_password
ALERT_THRESHOLD=70

### 4. Set up React frontend
```bash
cd ../gflux-ui
npm install
```

---

## Running the app

You need **two terminals** running simultaneously.

### Terminal 1 — Python backend
```bash
cd gflux
python api.py
```
API starts at: `http://localhost:8000`

### Terminal 2 — React frontend
```bash
cd gflux-ui
npm run dev
```
Dashboard opens at: `http://localhost:8080`

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gpu/metrics` | Live GPU telemetry + risk score |
| GET | `/api/simulate/{type}` | Simulate an attack (extraction, snooping, timing, membership, inversion) |
| GET | `/api/events/active` | All flagged attack events |
| GET | `/api/alerts` | Confirmed alerts only |
| GET | `/api/system/health` | System status + threshold |

---

## Dashboard pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Live metrics, attack table, GPU stats |
| Attack detail | `/security/events/:id` | Forensic investigation view |
| Attack types | `/security/attack-types` | Reference guide to 5 attack types |
| Mitigation | `/mitigation` | Step-by-step response plans |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Detection engine | Python · NumPy · Autoencoder |
| API | FastAPI · Uvicorn |
| Frontend | React · TypeScript · Vite |
| Styling | VISA-themed (Navy + Yellow + White) |
| Alerts | Outlook SMTP · port 587 · STARTTLS |

---

## Demo

To see the detection in action without real GPU hardware:

1. Start both servers (see above)
2. Open `http://localhost:8080/dashboard`
3. Click **Simulate Attack** — a random attack is generated
4. Watch the attack appear in the table within 5 seconds
5. Click any row to see the full forensic detail
6. Check the **Mitigation** tab for response steps

The auto-simulator also generates attacks every 4 seconds automatically.

---

## Detection performance

Tested on 100 samples per attack type:

| Metric | Value |
|--------|-------|
| False positive rate | 0% |
| Extraction detection | 98% |
| Snooping detection | 98% |
| Avg risk score (benign) | 20–30 / 100 |
| Avg risk score (attack) | 84–93 / 100 |