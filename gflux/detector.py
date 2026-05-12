import time
from collections import deque
from features import normalize


class GFluxDetector:
    def __init__(self, model, threshold, scaler, min_consecutive=3):
        self.model = model
        self.threshold = threshold
        self.scaler = scaler
        self.alerts = []
        self._buf = deque(maxlen=min_consecutive * 2)
        self._min = min_consecutive

    def ingest(self, raw_sample):
        fv = normalize(raw_sample, self.scaler)
        err = float(self.model.error(fv[None, :])[0])
        flagged = err > self.threshold
        self._buf.append(flagged)

        alert = len(self._buf) >= self._min and all(list(self._buf)[-self._min :])
        risk = round(min(100.0, (err / self.threshold) * 50), 1)

        result = {
            "ts":        time.strftime("%H:%M:%S"),
            "error":     round(err, 5),
            "threshold": round(self.threshold, 5),
            "risk":      risk,
            "flagged":   flagged,
            "alert":     alert,
        }
        if alert:
            self.alerts.append(result)
        return result
