import numpy as np
from simulator import benign, extraction, snooping
from features import fit_scaler, normalize
from model import build_baseline
from detector import GFluxDetector


def main():
    print("\n" + "=" * 50)
    print("  G-Flux  —  GPU Telemetry Threat Detection")
    print("=" * 50)

    print("\n[1] Generating 500 benign training samples...")
    train = [benign() for _ in range(500)]
    scaler = fit_scaler(train)
    X_train = np.stack([normalize(s, scaler) for s in train])

    print("[2] Training autoencoder baseline...")
    model, threshold = build_baseline(X_train)
    print(f"    threshold = {threshold:.5f}")

    det = GFluxDetector(model, threshold, scaler, min_consecutive=3)

    print("\n[3] BENIGN traffic (100 samples)")
    benign_res = [det.ingest(benign()) for _ in range(100)]
    b_flags  = sum(r["flagged"] for r in benign_res)
    b_alerts = sum(r["alert"]   for r in benign_res)
    print(f"    flags={b_flags}  alerts={b_alerts}  (want ~0)")

    det._buf.clear()

    print("\n[4] EXTRACTION ATTACK traffic (100 samples)")
    atk_res = [det.ingest(extraction()) for _ in range(100)]
    a_flags  = sum(r["flagged"] for r in atk_res)
    a_alerts = sum(r["alert"]   for r in atk_res)
    print(f"    flags={a_flags}  alerts={a_alerts}  (want >0)")

    det._buf.clear()

    print("\n[5] GPU SNOOPING ATTACK traffic (100 samples)")
    snoop_res = [det.ingest(snooping()) for _ in range(100)]
    s_flags  = sum(r["flagged"] for r in snoop_res)
    s_alerts = sum(r["alert"]   for r in snoop_res)
    print(f"    flags={s_flags}  alerts={s_alerts}  (want >0)")

    print("\n" + "=" * 50)
    print("  SUMMARY")
    print("=" * 50)
    print(f"  False Positive Rate    : {b_alerts}%")
    print(f"  Extraction Detection   : {a_alerts}%")
    print(f"  Snooping Detection     : {s_alerts}%")

    if det.alerts:
        last = det.alerts[-1]
        print(f"\n  Last alert sample:")
        print(f"    time      = {last['ts']}")
        print(f"    risk      = {last['risk']} / 100")
        print(f"    error     = {last['error']}  (threshold {last['threshold']})")
        print("\n  ✅  Extraction attack DETECTED via GPU telemetry\n")
    else:
        print("\n  ⚠️   No alerts fired\n")


if __name__ == "__main__":
    main()
