import { createFileRoute, Link } from "@tanstack/react-router";
import { GFluxLayout, card, mono } from "@/components/GFluxLayout";

export const Route = createFileRoute("/mitigation")({
  component: MitigationPage,
  head: () => ({ meta: [{ title: "Mitigation — G-Flux" }] }),
});

const plans = [
  {
    attack: "Model Extraction Probe",
    gpu: "GPU:1 · A100",
    model: "GPT-ResNet-v3",
    severity: "Critical",
    steps: [
      "Rate-limit API to max 10 requests/min per client IP immediately",
      "Enable query deduplication — reject near-identical inputs",
      "Rotate API keys for all external consumers",
      "Enable output perturbation — add calibrated noise to logits",
      "Flag and block the source IP range at the firewall",
      "Notify security team and open incident ticket",
    ],
    longTerm: [
      "Implement watermarking in model outputs",
      "Deploy model ensemble to obscure decision boundaries",
      "Add authentication layer with per-user query budgets",
    ],
    status: "Action Required",
    statusColor: "#EF4444",
  },
  {
    attack: "GPU Snooping Attack",
    gpu: "GPU:0 · A100",
    model: "LLaMA-7B",
    severity: "Critical",
    steps: [
      "Isolate the affected GPU from shared tenant access immediately",
      "Terminate all co-located workloads on GPU:0",
      "Flush GPU L2 cache and reset memory controller",
      "Enable GPU memory encryption (AES-XTS) if not already on",
      "Audit PCIe DMA access logs for unauthorized transfers",
      "Migrate LLaMA-7B to a dedicated isolated GPU node",
    ],
    longTerm: [
      "Enforce strict GPU partitioning — no multi-tenant sharing",
      "Enable NVIDIA Confidential Computing for sensitive models",
      "Deploy PCIe traffic monitoring with anomaly thresholds",
    ],
    status: "Action Required",
    statusColor: "#EF4444",
  },
  {
    attack: "Timing Side-Channel",
    gpu: "GPU:2 · A100",
    model: "BERT-Classifier",
    severity: "High",
    steps: [
      "Add random latency jitter (5–50ms) to all API responses",
      "Batch all inference requests — never expose per-query timing",
      "Disable verbose error messages that leak timing information",
      "Implement constant-time response padding to fixed length",
      "Review kernel execution order for timing predictability",
    ],
    longTerm: [
      "Redesign API to return responses in fixed time windows",
      "Use oblivious RAM techniques for memory access patterns",
      "Regular timing analysis audits of inference pipeline",
    ],
    status: "In Progress",
    statusColor: "#F59E0B",
  },
  {
    attack: "Membership Inference",
    gpu: "GPU:1 · A100",
    model: "VGG-Encoder",
    severity: "High",
    steps: [
      "Enable differential privacy — add calibrated noise to outputs",
      "Reduce confidence score precision to 2 decimal places",
      "Implement prediction confidence thresholding — never return >95%",
      "Limit number of queries per user session to 50/hour",
      "Audit training data for PII and sensitive records",
    ],
    longTerm: [
      "Retrain model with differential privacy (ε ≤ 1.0)",
      "Implement membership inference detection as a pre-filter",
      "Regular privacy audits using ML Privacy Meter tool",
    ],
    status: "Monitoring",
    statusColor: "#1A1F71",
  },
  {
    attack: "Model Inversion",
    gpu: "GPU:3 · A100",
    model: "ResNet-50",
    severity: "Medium",
    steps: [
      "Restrict API to return top-1 prediction only — no full logits",
      "Add output quantization — round probabilities to 10% buckets",
      "Enable request logging with full input capture for forensics",
      "Block reconstruction-style query patterns at the API gateway",
    ],
    longTerm: [
      "Apply representation regularization during model training",
      "Deploy prediction API behind a privacy-preserving proxy",
      "Evaluate model for training data leakage quarterly",
    ],
    status: "Resolved",
    statusColor: "#10B981",
  },
];

const severityColor: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F59E0B",
  Medium: "#1A1F71",
  Low: "#10B981",
};

function MitigationPage() {
  return (
    <GFluxLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ color: "#1A1F71", fontSize: 24, fontWeight: 700, margin: 0 }}>
          Mitigation Plans
        </h1>
        <span style={{ fontFamily: mono, fontSize: 12, color: "#888" }}>
          {plans.filter(p => p.status === "Action Required").length} requiring immediate action
        </span>
      </div>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24, marginTop: 4 }}>
        Step-by-step response plans for each detected GPU-based attack
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {plans.map((p) => (
          <div key={p.attack} style={{
            ...card,
            borderLeft: `4px solid ${severityColor[p.severity]}`,
            padding: "20px 24px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={{ color: "#1A1F71", fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {p.attack}
                  </h2>
                  <span style={{
                    background: `${severityColor[p.severity]}18`,
                    color: severityColor[p.severity],
                    padding: "2px 10px", borderRadius: 5,
                    fontSize: 11, fontWeight: 600
                  }}>{p.severity}</span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 12, color: "#888" }}>
                  {p.gpu} · {p.model}
                </span>
              </div>
              <span style={{
                background: `${p.statusColor}15`,
                color: p.statusColor,
                padding: "4px 12px", borderRadius: 6,
                fontSize: 12, fontWeight: 600
              }}>{p.status}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Immediate steps */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Immediate Actions
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.steps.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        minWidth: 20, height: 20, borderRadius: "50%",
                        background: "#1A1F71", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, marginTop: 1
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Long term */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Long-term Hardening
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {p.longTerm.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        minWidth: 20, height: 20, borderRadius: "50%",
                        background: "#F7B600", color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, marginTop: 1
                      }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GFluxLayout>
  );
}