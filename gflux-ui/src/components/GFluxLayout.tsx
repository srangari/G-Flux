import { Link, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/security/attack-types", label: "Attack Types" },
  { to: "/mitigation", label: "Mitigation" },
];

export function GFluxLayout({ children }: { children?: ReactNode }) {
  return (
    <div style={{ background: "var(--gflux-bg)", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 220,
          background: "var(--gflux-navy)",
          color: "white",
          padding: "24px 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            background: "#fff",
            borderRadius: 6,
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
          }}>
            <img src="/visa-logo.png" alt="VISA" style={{ height: 22 }} />
          </div>
          <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.25)" }} />
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
            G-<span style={{ color: "var(--gflux-yellow)" }}>Flux</span>
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ style: { background: "rgba(247,182,0,0.15)", color: "var(--gflux-yellow)" } }}
              style={{
                color: "white",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ marginLeft: 220, padding: "32px 40px" }}>{children ?? <Outlet />}</main>
    </div>
  );
}

export const card: React.CSSProperties = {
  background: "white",
  border: "1px solid var(--gflux-border)",
  borderRadius: 12,
  padding: 24,
};

export const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
