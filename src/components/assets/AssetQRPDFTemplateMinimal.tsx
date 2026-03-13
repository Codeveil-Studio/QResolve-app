import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Asset } from "@/lib/supabase-types";

interface AssetQRPDFTemplateMinimalProps {
  asset: Asset;
  qrUrl: string;
}

export const AssetQRPDFTemplateMinimal = React.forwardRef<HTMLDivElement, AssetQRPDFTemplateMinimalProps>(
  ({ asset, qrUrl }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "148mm",
          height: "210mm",
          margin: "0",
          padding: "10mm",
          backgroundColor: "#ffffff",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          color: "#0f172a",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10mm" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
            <div
              style={{
                width: "8mm",
                height: "8mm",
                borderRadius: "2mm",
                backgroundColor: "#06d6a0",
              }}
            />
            <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.02em" }}>QResolve</div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>Scan to report an issue</div>
        </div>

        <div style={{ display: "flex", gap: "10mm", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.9rem", color: "#475569", fontWeight: 700 }}>Asset</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.1, marginTop: "1.5mm" }}>{asset.name}</div>
            <div style={{ marginTop: "6mm" }}>
              <div style={{ fontSize: "0.9rem", color: "#475569", fontWeight: 700 }}>Location</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1.5mm" }}>{asset.location || "Not specified"}</div>
            </div>

            <div style={{ marginTop: "10mm", padding: "6mm", borderRadius: "4mm", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: "1rem", fontWeight: 900, marginBottom: "3mm" }}>How it works</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>1. Scan the QR</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: "2mm" }}>2. Select the issue</div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginTop: "2mm" }}>3. We’ll fix it fast</div>
              <div style={{ marginTop: "4mm", fontSize: "0.8rem", color: "#64748b" }}>Takes less than 10 seconds</div>
            </div>
          </div>

          <div style={{ width: "70mm", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: "70mm",
                height: "70mm",
                border: "2px solid #0f172a",
                borderRadius: "6mm",
                backgroundColor: "#ffffff",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "3mm",
                boxSizing: "border-box",
              }}
            >
              <QRCodeSVG value={qrUrl} size={240} level="H" style={{ width: "100%", height: "100%" }} />
            </div>
            <div style={{ marginTop: "4mm", fontSize: "0.85rem", color: "#334155", fontWeight: 700, textAlign: "center" }}>
              Powered by QResolve
            </div>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "8mm", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6mm" }}>
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>ID: {asset.id}</div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "right" }}>qresolve.com</div>
        </div>
      </div>
    );
  }
);

AssetQRPDFTemplateMinimal.displayName = "AssetQRPDFTemplateMinimal";

