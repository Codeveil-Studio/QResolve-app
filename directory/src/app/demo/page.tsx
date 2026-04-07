"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#08080A" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, color: "#8fa89a", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
          <ArrowLeft size={16} />
          Back to QResolve
        </Link>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 2 }}>Interactive Demo</p>
          <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e8efe9" }}>Relay by QResolve</p>
        </div>
        <a href="https://relay.qresolve.com/signup" style={{ padding: "8px 16px", background: "#34d399", color: "#000", borderRadius: 8, textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
          Start Free
        </a>
      </div>

      {/* Full-screen iframe */}
      <iframe
        src="/demo/relay-demo.html"
        style={{ flex: 1, width: "100%", border: "none", display: "block" }}
        title="Relay Interactive Demo"
      />
    </div>
  );
}
