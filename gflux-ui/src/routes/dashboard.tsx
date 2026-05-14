import { createFileRoute, Link } from "@tanstack/react-router";
import { GFluxLayout, card, mono } from "@/components/GFluxLayout";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard – G-Flux" }] }),
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────
interface GpuMetrics {
  gpu_util: number;
  power_w: number;
  temp_c: number;
  pcie_tx_gbps: number;
  pcie_rx_gbps: number;
  kernel_launches_s: number;
  rps: number;
  risk: number;
  flagged: boolean;
  alert: boolean;
  ts: string;
}

interface AttackEvent {
  id?: string;
  attack_type: string;
  gpu: string;
  model: string;
  risk: number;
  flagged: boolean;
  alert: boolean;
  ts: string;
}

// ── Helpers ──────────────────────────────────────────────────
function confColor(c: number) {
  if (c > 80) return "var(--gflux-red)";
  if (c >= 50) return "var(--gflux-amber)";
  return "var(--gflux-green)";
}

function statusBadge(flagged: boolean, alert: boolean) {
  const s = alert ? "Alert" : flagged ? "Detecting" : "Normal";
  const map: Record<string, { bg: string; fg: string }> = {
    Alert:      { bg: "rgba(220, 38, 38, 0.12)", fg: "var(--gflux-red)" },
    Detecting:  { bg: "rgba(247, 182, 0, 0.14)", fg: "var(--gflux-navy)" },
    Normal:     { bg: "rgba(5, 150, 105, 0.14)", fg: "var(--gflux-green)" },
  };
  const c = map[s];
  return (
    <span style={{ background: c.bg, color: c.fg, padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 0.4 }}>
      {s}
    </span>
  );
}

function getRiskSub(risk: number) {
  if (risk < 40) return "✓ Low Risk — normal activity";
  if (risk <= 70) return "⚠ Elevated — monitor closely";
  return "🚨 Critical — immediate action";
}

const ATTACK_ID_MAP: Record<string, string> = {
  "Model Extraction Probe": "a1",
  "Membership Inference": "a2",
  "Adversarial Input Scan": "a3",
  "Timing Side-Channel": "a4",
  "Model Inversion": "a5",
  "GPU Snooping Attack": "a1",
};

// ── Component ────────────────────────────────────────────────
function Dashboard() {
  const [metrics, setMetrics] = useState<GpuMetrics | null>(null);
  const [events, setEvents]   = useState<AttackEvent[]>([]);
  const [health, setHealth]   = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [flashMessage, setFlashMessage] = useState(false);

  const fetchEvents = async () => {
    try {
      // Run an extraction + snooping simulation to generate events
      await fetch(`${API}/api/simulate/extraction`);
      await fetch(`${API}/api/simulate/snooping`);
      const res  = await fetch(`${API}/api/events/active`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      console.error("Failed to fetch events", e);
    }
  };

  // Fetch live GPU metrics every 3 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res  = await fetch(`${API}/api/gpu/metrics`);
        const data = await res.json();
        setMetrics(data);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch metrics", e);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active attack events every 5 seconds
  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const simulateAttack = async () => {
    setSimulating(true);
    try {
      const urls = [
        `${API}/api/simulate/extraction`,
        `${API}/api/simulate/snooping`,
        `${API}/api/simulate/timing`,
        `${API}/api/simulate/membership`,
        `${API}/api/simulate/inversion`,
      ];
      const url = urls[Math.floor(Math.random() * urls.length)];
      await fetch(url);
    } catch (e) {
      console.error("Failed to simulate attack", e);
    } finally {
      setSimulating(false);
      await fetchEvents();
      setFlashMessage(true);
      window.setTimeout(() => setFlashMessage(false), 2000);
    }
  };

  // Fetch system health once
  useEffect(() => {
    fetch(`${API}/api/system/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  const summaryCards = [
    { label: "GPU:0 · A100 Utilization", value: metrics ? `${metrics.gpu_util}%` : "—", sub: metrics ? getRiskSub(metrics.risk) : "—" },
    { label: "GPU:1 · A100 Utilization", value: metrics ? `${metrics.gpu_util}%` : "—", sub: metrics ? getRiskSub(metrics.risk) : "—" },
    { label: "Threat Events",            value: health.total_flagged ?? "—",         sub: "Active threats detected" },
    { label: "PCIe Bandwidth",           value: metrics ? `${metrics.pcie_tx_gbps} GB/s` : "—", sub: "Current bandwidth usage" },
  ];

  return (
    <GFluxLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ background: "var(--gflux-yellow)", color: "var(--gflux-navy)", padding: "6px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
              GPU Security
            </span>
            <span style={{ color: "var(--gflux-muted)", fontSize: 12 }}>VISA-inspired operations dashboard</span>
          </div>
          <h1 style={{ color: "var(--gflux-navy)", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
            Dashboard Overview
          </h1>
        </div>

        <div style={{ fontFamily: mono, fontSize: 12, color: "var(--gflux-muted)", display: "flex", alignItems: "center", gap: 10 }}>
          <span>{metrics ? `Last updated: ${metrics.ts}` : "Connecting..."}</span>
          <span style={{ display: "inline-flex", width: 10, height: 10, borderRadius: "50%", background: loading ? "var(--gflux-amber)" : "var(--gflux-green)", boxShadow: "0 0 0 4px rgba(247,182,0,0.12)" }} />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 18, marginBottom: 32 }}>
        {summaryCards.map((m) => (
          <div
            key={m.label}
            style={{
              ...card,
              borderLeft: "4px solid var(--gflux-yellow)",
              boxShadow: "0 18px 55px rgba(26, 31, 113, 0.08)",
              padding: 20,
            }}
          >
            <div style={{ color: "var(--gflux-muted)", fontSize: 13, marginBottom: 10, letterSpacing: 0.3 }}>{m.label}</div>
            <div style={{ fontFamily: mono, fontSize: 32, fontWeight: 800, color: "var(--gflux-navy)" }}>{m.value}</div>
            <div style={{ color: "var(--gflux-muted)", fontSize: 12, marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Live GPU Metrics Bar */}
      {metrics && (
        <div style={{ ...card, marginBottom: 32, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 16, background: "#F8F9FF" }}>
          {[
            ["Kernel Launches/s", metrics.kernel_launches_s, "GPU compute activity"],
            ["PCIe RX GB/s",      metrics.pcie_tx_gbps, "Data transfer in/out"],
            ["PCIe TX GB/s",      metrics.pcie_rx_gbps, "Data transfer in/out"],
            ["GPU Util %",        metrics.gpu_util, "Processing load"],
            ["Risk Score",        metrics.risk, "Attack likelihood"],
          ].map(([label, val, sub]) => {
            let barColor = "var(--gflux-navy)"; // default navy
            if (label === "GPU Util %") {
              barColor = Number(val) >= 85 ? "var(--gflux-red)" : "var(--gflux-yellow)";
            } else if (label === "Risk Score") {
              const risk = Number(val);
              if (risk < 40) barColor = "var(--gflux-green)";
              else if (risk <= 70) barColor = "var(--gflux-amber)";
              else barColor = "var(--gflux-red)";
            }
            return (
              <div key={label as string} style={{ padding: "14px 0" }}>
                <div style={{ fontSize: 11, color: "var(--gflux-muted)", marginBottom: 10 }}>{label}</div>
                <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: "var(--gflux-navy)" }}>
                  {typeof val === "number" ? val.toFixed(1) : val}
                </div>
                <div style={{ marginTop: 10, height: 6, background: "rgba(26,31,113,0.08)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.min(100, Number(val))}%`,
                    background: barColor,
                    transition: "width 0.8s ease"
                  }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--gflux-muted)", marginTop: 6, textAlign: "center" }}>{sub}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attack Events Table */}
      {(() => {
        const uniqueEvents = Object.values(
          events.reduce((acc, e) => {
            if (!acc[e.attack_type] || e.ts > acc[e.attack_type].ts)
              acc[e.attack_type] = e;
            return acc;
          }, {} as Record<string, typeof events[0]>)
        ).sort((a, b) => b.ts.localeCompare(a.ts)).filter(e => e.risk > 40).slice(0, 5);
        
        return (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", marginBottom: 16, gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ color: "var(--gflux-navy)", fontSize: 20, fontWeight: 700, margin: 0, marginBottom: 4 }}>
                    Active Attack Detections
                  </h2>
                  <div style={{ color: "var(--gflux-muted)", fontSize: 12 }}>Showing critical & elevated threats only</div>
                </div>
                <button
                  type="button"
                  onClick={simulateAttack}
                  disabled={simulating}
                  style={{
                    background: "#1A1F71",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 16px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 500,
                    opacity: simulating ? 0.8 : 1,
                  }}
                >
                  {simulating ? "Simulating..." : "Simulate Attack"}
                </button>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(247,182,0,0.14)", color: "var(--gflux-navy)", padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gflux-yellow)" }} />
                {uniqueEvents.length} active threat{uniqueEvents.length === 1 ? "" : "s"}
              </div>
            </div>
            {flashMessage && (
              <div style={{ marginBottom: 16, borderRadius: 10, padding: "12px 16px", background: "rgba(247,182,0,0.16)", color: "#1A1F71", fontWeight: 700 }}>
                ⚠ Attack Simulated!
              </div>
            )}

            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              {uniqueEvents.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--gflux-muted)", fontFamily: mono }}>
                  No critical threats detected — simulating traffic...
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--gflux-border)" }}>
                      {["Attack Type", "GPU Target", "Model at Risk", "Risk Score", "Status", "Time"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 600, color: "var(--gflux-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueEvents.map((a, i) => {
                      const isLast    = i === uniqueEvents.length - 1;
                      const detecting = a.flagged;
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: isLast ? "none" : "1px solid var(--gflux-border)",
                      background: detecting ? "rgba(247,182,0,0.06)" : "transparent",
                      borderLeft: detecting ? "3px solid var(--gflux-yellow)" : "3px solid transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      localStorage.setItem('gflux_selected_event', JSON.stringify(a));
                      window.location.href = `/security/events/${ATTACK_ID_MAP[a.attack_type] ?? 'a1'}`;
                    }}
                  >
                    <td style={{ padding: "16px 20px", color: "var(--gflux-navy)", fontWeight: 600, fontSize: 14 }}>
                      {a.attack_type}
                    </td>
                    <td style={{ padding: "16px 20px", fontFamily: mono, fontSize: 13, color: "var(--gflux-navy)" }}>{a.gpu}</td>
                    <td style={{ padding: "16px 20px", fontFamily: mono, fontSize: 13, color: "var(--gflux-navy)" }}>{a.model}</td>
                    <td style={{ padding: "16px 20px", fontFamily: mono, fontSize: 14, fontWeight: 700, color: confColor(a.risk) }}>{a.risk}%</td>
                    <td style={{ padding: "16px 20px" }}>{statusBadge(a.flagged, a.alert)}</td>
                    <td style={{ padding: "16px 20px", fontFamily: mono, fontSize: 13, color: "var(--gflux-muted)" }}>{a.ts}</td>
                    </tr>
                    );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        );
      })()}
    </GFluxLayout>
  );
}