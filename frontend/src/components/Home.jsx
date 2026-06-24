// Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "#0f172a" }}>
      
      {/* Hero Badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f1f5f9", padding: "6px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "20px" }}>
        <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
        v2.4 Production Engine Ready
      </div>

      <h1 style={{ fontSize: "48px", fontWeight: "850", letterSpacing: "-1px", margin: "0 0 12px 0", lineHeight: "1.1" }}>
        QueueCure
      </h1>
      
      <p style={{ fontSize: "20px", fontWeight: "500", color: "#475569", maxWidth: "540px", margin: "0 auto 32px auto", lineHeight: "1.4" }}>
        Real-Time Queue Management & Live Sync for Local Neighborhood Clinics.
      </p>

      {/* Primary Value-Prop Metric Callout Card */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "16px 24px", maxWidth: "420px", margin: "0 auto 40px auto", fontSize: "14px", color: "#b45309", fontWeight: "600" }}>
        📊 Fact: 76% of local clinics still use paper tokens. QueueCure digitizes patient flow with zero infrastructure friction.
      </div>

      {/* Navigation Portals Router Links */}
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
        <Link to="/reception" style={{ textDecoration: "none", background: "#0f172a", color: "white", padding: "14px 28px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.15)" }}>
          Launch Reception Terminal
        </Link>
        <Link to="/patient" style={{ textDecoration: "none", background: "white", color: "#0f172a", padding: "14px 28px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)" }}>
          Open Patient Portal Companion
        </Link>
      </div>

    </div>
  );
}