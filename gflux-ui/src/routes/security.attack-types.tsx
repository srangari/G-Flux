import { createFileRoute } from "@tanstack/react-router";
import { GFluxLayout, card, mono } from "@/components/GFluxLayout";

export const Route = createFileRoute("/security/attack-types")({
  component: AttackTypes,
  head: () => ({ meta: [{ title: "Attack Types — G-Flux" }] }),
});

const types = [
  { name: "Model Extraction Probe", desc: "Adversary reconstructs model weights via systematic inference queries.", method: "Query volume + kernel sequence analysis", risk: "Critical", time: "4.2 min" },
  { name: "Membership Inference", desc: "Determines if specific data was used in model training.", method: "Output confidence distribution analysis", risk: "High", time: "11.7 min" },
  { name: "Timing Side-Channel", desc: "Exploits GPU execution timing to infer model architecture.", method: "PCIe timing + kernel duration profiling", risk: "High", time: "8.3 min" },
  { name: "Model Inversion", desc: "Reconstructs training data from model predictions.", method: "Memory access pattern + tensor utilization", risk: "Critical", time: "6.1 min" },
  { name: "Adversarial Input Scan", desc: "Probes decision boundaries to craft adversarial examples.", method: "Input pattern clustering + outlier detection", risk: "Medium", time: "15.4 min" },
  { name: "Data Poisoning Detection", desc: "Identifies attempts to corrupt model behavior via inputs.", method: "Activation pattern + gradient anomaly tracking", risk: "High", time: "22.8 min" },
];

function riskBadge(r: string) {
  const isCritical = r === "Critical";
  const map: Record<string, { bg: string; fg: string }> = {
    Critical: { bg: "var(--gflux-yellow)", fg: "var(--gflux-navy)" },
    High: { bg: "#FEE2E2", fg: "var(--gflux-red)" },
    Medium: { bg: "#FEF3C7", fg: "var(--gflux-amber)" },
  };
  const c = map[r];
  return (
    <span style={{ background: c.bg, color: c.fg, padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: isCritical ? 700 : 600 }}>
      {r}
    </span>
  );
}

function AttackTypes() {
  return (
    <GFluxLayout>
      <h1 style={{ color: "var(--gflux-navy)", fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
        GPU-Based Attack Types
      </h1>
      <p style={{ color: "var(--gflux-muted)", fontSize: 14, margin: "0 0 24px" }}>
        Detected threat categories monitored by G-Flux
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {types.map((t) => (
          <div key={t.name} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--gflux-navy)" }}>{t.name}</div>
              {riskBadge(t.risk)}
            </div>
            <p style={{ color: "var(--gflux-muted)", fontSize: 14, margin: "10px 0 16px", lineHeight: 1.5 }}>{t.desc}</p>
            <div style={{ fontFamily: mono, fontSize: 12, color: "var(--gflux-navy)", padding: "6px 10px", background: "var(--gflux-bg)", borderRadius: 6, display: "inline-block" }}>
              {t.method}
            </div>
            <div style={{ borderTop: "1px solid var(--gflux-border)", marginTop: 16, paddingTop: 12, fontFamily: mono, fontSize: 13, color: "var(--gflux-muted)" }}>
              Avg detection: <span style={{ color: "var(--gflux-navy)", fontWeight: 700 }}>{t.time}</span>
            </div>
          </div>
        ))}
      </div>
    </GFluxLayout>
  );
}
