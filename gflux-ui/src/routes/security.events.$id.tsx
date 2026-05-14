import { createFileRoute, Link } from "@tanstack/react-router";
import { GFluxLayout, card, mono } from "@/components/GFluxLayout";

export const Route = createFileRoute("/security/events/$id")({
  component: AttackDetail,
  head: () => ({ meta: [{ title: "Attack Detail — G-Flux" }] }),
});

type AttackData = {
  name: string;
  gpu: string;
  model: string;
  status: "Detecting" | "Investigating" | "Resolved";
  confidence: number;
  firstDetected: string;
  summary: string;
  queries: number;
  baselineMult: number;
  queryBars: number[];
  anomalousCount: number;
  flagged: string;
  kernels: string[];
  pcie: string;
  pcieMult: number;
  sparkPts: number[];
  timeline: { t: string; msg: string; level: "ok" | "warn" | "crit" | "info" }[];
};

const ATTACKS: Record<string, AttackData> = {
  a1: {
    name: "Model Extraction Probe",
    gpu: "GPU:1 · A100",
    model: "GPT-ResNet-v3",
    status: "Detecting",
    confidence: 94,
    firstDetected: "14:32:07 UTC",
    summary: "2,847 atypical inference queries detected in 4 minutes — systematic probing pattern identified",
    queries: 2847,
    baselineMult: 12.4,
    queryBars: [3, 4, 3, 5, 4, 6, 8, 14, 22, 28],
    anomalousCount: 6,
    flagged: "linear, gemm_batched flagged",
    kernels: ["sgemm_batched_kernel", "linear_fp16", "softmax_warp_2d"],
    pcie: "31.2 GB/s",
    pcieMult: 2.8,
    sparkPts: [4, 5, 4, 6, 8, 12, 18, 24, 30, 31],
    timeline: [
      { t: "14:28:01", msg: "Baseline query rate normal", level: "ok" },
      { t: "14:29:44", msg: "Query rate deviation +40% detected", level: "warn" },
      { t: "14:30:12", msg: "Kernel execution pattern changed", level: "warn" },
      { t: "14:31:05", msg: "PCIe throughput spike +180%", level: "crit" },
      { t: "14:32:07", msg: "Attack classification: Model Extraction", level: "crit" },
      { t: "14:32:09", msg: "Alert dispatched to security team", level: "info" },
    ],
  },
  a2: {
    name: "Membership Inference",
    gpu: "GPU:0 · A100",
    model: "BERT-Classifier",
    status: "Investigating",
    confidence: 71,
    firstDetected: "13:58:22 UTC",
    summary: "412 boundary-probing queries observed — caller is testing training-set membership of records",
    queries: 412,
    baselineMult: 3.6,
    queryBars: [4, 5, 6, 5, 7, 9, 8, 11, 10, 12],
    anomalousCount: 3,
    flagged: "softmax, embedding_lookup flagged",
    kernels: ["softmax_fp32", "embedding_lookup", "layernorm_fwd"],
    pcie: "9.4 GB/s",
    pcieMult: 1.4,
    sparkPts: [6, 7, 6, 8, 9, 10, 11, 12, 11, 12],
    timeline: [
      { t: "13:54:10", msg: "Baseline query rate normal", level: "ok" },
      { t: "13:55:32", msg: "Repeated near-duplicate inputs detected", level: "warn" },
      { t: "13:57:01", msg: "Confidence-score harvesting pattern", level: "warn" },
      { t: "13:58:22", msg: "Attack classification: Membership Inference", level: "warn" },
      { t: "13:58:25", msg: "Investigation handed to analyst", level: "info" },
    ],
  },
  a3: {
    name: "Adversarial Input Scan",
    gpu: "GPU:2 · A100",
    model: "VGG-Encoder",
    status: "Investigating",
    confidence: 63,
    firstDetected: "13:35:11 UTC",
    summary: "189 perturbed inputs with high gradient norm — likely white-box adversarial probing",
    queries: 189,
    baselineMult: 2.1,
    queryBars: [2, 3, 4, 3, 5, 4, 6, 5, 7, 8],
    anomalousCount: 4,
    flagged: "conv2d, relu_bwd flagged",
    kernels: ["conv2d_fp16_nhwc", "relu_bwd", "maxpool2d", "batchnorm_fwd"],
    pcie: "6.7 GB/s",
    pcieMult: 1.2,
    sparkPts: [3, 4, 5, 4, 6, 7, 6, 8, 7, 8],
    timeline: [
      { t: "13:30:00", msg: "Baseline gradients within normal range", level: "ok" },
      { t: "13:32:14", msg: "Gradient norm outlier detected", level: "warn" },
      { t: "13:34:02", msg: "Repeated perturbation deltas observed", level: "warn" },
      { t: "13:35:11", msg: "Attack classification: Adversarial Probe", level: "warn" },
      { t: "13:35:14", msg: "Logged for analyst review", level: "info" },
    ],
  },
  a4: {
    name: "Timing Side-Channel",
    gpu: "GPU:1 · A100",
    model: "LLaMA-7B",
    status: "Detecting",
    confidence: 82,
    firstDetected: "13:12:48 UTC",
    summary: "Inference latency variance correlated with secret token positions — timing leak observed",
    queries: 1024,
    baselineMult: 5.7,
    queryBars: [5, 6, 5, 7, 9, 11, 13, 16, 18, 20],
    anomalousCount: 5,
    flagged: "attention, kv_cache flagged",
    kernels: ["flash_attention_v2", "kv_cache_update", "rmsnorm_fwd"],
    pcie: "18.6 GB/s",
    pcieMult: 1.9,
    sparkPts: [5, 6, 8, 10, 12, 15, 17, 19, 20, 21],
    timeline: [
      { t: "13:08:30", msg: "Baseline token latency stable", level: "ok" },
      { t: "13:10:02", msg: "Latency variance +60% detected", level: "warn" },
      { t: "13:11:21", msg: "Position-correlated jitter pattern", level: "crit" },
      { t: "13:12:48", msg: "Attack classification: Timing Side-Channel", level: "crit" },
      { t: "13:12:51", msg: "Alert dispatched to security team", level: "info" },
    ],
  },
  a5: {
    name: "Model Inversion",
    gpu: "GPU:3 · A100",
    model: "ResNet-50",
    status: "Resolved",
    confidence: 48,
    firstDetected: "11:04:12 UTC",
    summary: "76 reconstruction-style queries observed — session terminated and key revoked",
    queries: 76,
    baselineMult: 1.6,
    queryBars: [2, 2, 3, 2, 3, 4, 3, 4, 3, 2],
    anomalousCount: 2,
    flagged: "deconv, upsample flagged",
    kernels: ["deconv2d_fp32", "upsample_bilinear"],
    pcie: "4.2 GB/s",
    pcieMult: 1.1,
    sparkPts: [3, 4, 4, 5, 4, 4, 3, 3, 2, 2],
    timeline: [
      { t: "11:00:00", msg: "Baseline activity normal", level: "ok" },
      { t: "11:02:18", msg: "Reconstruction query pattern detected", level: "warn" },
      { t: "11:04:12", msg: "Attack classification: Model Inversion", level: "warn" },
      { t: "11:05:40", msg: "Session terminated, API key revoked", level: "info" },
      { t: "11:06:02", msg: "Incident closed", level: "ok" },
    ],
  },
};

const STATUS_STYLE: Record<AttackData["status"], { bg: string; fg: string }> = {
  Detecting: { bg: "#FEE2E2", fg: "var(--gflux-red)" },
  Investigating: { bg: "#FEF3C7", fg: "var(--gflux-amber)" },
  Resolved: { bg: "#D1FAE5", fg: "var(--gflux-green)" },
};

const LEVEL_COLOR = {
  ok: "var(--gflux-green)",
  warn: "var(--gflux-amber)",
  crit: "var(--gflux-red)",
  info: "var(--gflux-navy)",
} as const;

function AttackDetail() {
  const { id } = Route.useParams();
  
  const stored = localStorage.getItem('gflux_selected_event');
  const liveEvent = stored ? JSON.parse(stored) : null;
  
  const a = ATTACKS[id] ?? ATTACKS.a1;
  const sb = STATUS_STYLE[a.status];
  const barMax = Math.max(...a.queryBars);
  const sparkMax = Math.max(...a.sparkPts) * 1.05;

  return (
    <GFluxLayout>
      <Link to="/dashboard" style={{ color: "var(--gflux-muted)", fontSize: 13, textDecoration: "none" }}>
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div style={{ ...card, marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "var(--gflux-navy)" }}>
            {liveEvent ? liveEvent.attack_type : a.name}
          </div>
          <div style={{ fontFamily: mono, fontSize: 14, color: "var(--gflux-muted)", marginTop: 6 }}>
            {liveEvent ? liveEvent.gpu : a.gpu} · {liveEvent ? liveEvent.model : a.model}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
            <span style={{ background: sb.bg, color: sb.fg, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
              {liveEvent && liveEvent.flagged ? "DETECTING" : a.status.toUpperCase()}
            </span>
            <span style={{ fontFamily: mono, fontSize: 13, color: "var(--gflux-muted)" }}>First detected: {liveEvent ? liveEvent.ts : a.firstDetected}</span>
          </div>
          <p style={{ marginTop: 16, color: "var(--gflux-navy)", fontSize: 14, lineHeight: 1.5 }}>{a.summary}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--gflux-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Risk / Confidence</div>
          <div style={{ fontFamily: mono, fontSize: 56, fontWeight: 700, color: "var(--gflux-yellow)", lineHeight: 1 }}>
            {liveEvent ? liveEvent.risk : a.confidence}%
          </div>
        </div>
      </div>

      {/* Middle 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
        <div style={card}>
          <div style={{ color: "var(--gflux-muted)", fontSize: 13, marginBottom: 8 }}>Query Pattern</div>
          <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: "var(--gflux-navy)" }}>
            {a.queries.toLocaleString()} queries
          </div>
          <div style={{ color: "var(--gflux-muted)", fontSize: 12, marginTop: 4 }}>{a.baselineMult}× above baseline</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, marginTop: 16 }}>
            {a.queryBars.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${(v / barMax) * 100}%`,
                  background: v > barMax * 0.5 ? "var(--gflux-yellow)" : "var(--gflux-navy)",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>

        <div style={card}>
          <div style={{ color: "var(--gflux-muted)", fontSize: 13, marginBottom: 8 }}>Kernel Anomalies</div>
          <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: "var(--gflux-navy)" }}>{a.anomalousCount} anomalous</div>
          <div style={{ color: "var(--gflux-muted)", fontSize: 12, marginTop: 4 }}>{a.flagged}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {a.kernels.map((k) => (
              <li key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: 13, color: "var(--gflux-navy)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gflux-red)" }} />
                {k}
              </li>
            ))}
          </ul>
        </div>

        <div style={card}>
          <div style={{ color: "var(--gflux-muted)", fontSize: 13, marginBottom: 8 }}>PCIe Activity</div>
          <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: "var(--gflux-navy)" }}>{a.pcie}</div>
          <div style={{ color: "var(--gflux-muted)", fontSize: 12, marginTop: 4 }}>{a.pcieMult}× above baseline</div>
          <svg viewBox="0 0 200 60" style={{ marginTop: 16, width: "100%", height: 60 }}>
            <polyline
              fill="none"
              stroke="var(--gflux-yellow)"
              strokeWidth="2"
              points={a.sparkPts.map((p, i) => `${(i / (a.sparkPts.length - 1)) * 200},${60 - (p / sparkMax) * 55}`).join(" ")}
            />
          </svg>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--gflux-navy)", marginBottom: 20 }}>Event Timeline</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" }}>
          {a.timeline.map((e, i, arr) => (
            <li key={e.t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--gflux-border)" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: LEVEL_COLOR[e.level], flexShrink: 0 }} />
              <span style={{ fontFamily: mono, fontSize: 13, color: "var(--gflux-muted)", width: 90 }}>{e.t}</span>
              <span style={{ fontSize: 14, color: "var(--gflux-navy)" }}>{e.msg}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
        <button style={{ background: "white", border: "1px solid var(--gflux-border)", color: "var(--gflux-navy)", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Mark False Positive
        </button>
        <button style={{ background: "var(--gflux-navy)", color: "white", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Escalate
        </button>
        <button style={{ background: "var(--gflux-yellow)", color: "var(--gflux-navy)", border: "none", padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Generate Report
        </button>
      </div>
    </GFluxLayout>
  );
}
