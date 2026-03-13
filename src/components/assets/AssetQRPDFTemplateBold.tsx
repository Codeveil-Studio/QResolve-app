import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Asset } from "@/lib/supabase-types";

interface AssetQRPDFTemplateBoldProps {
  asset: Asset;
  qrUrl: string;
}

export const AssetQRPDFTemplateBold = React.forwardRef<HTMLDivElement, AssetQRPDFTemplateBoldProps>(
  ({ asset, qrUrl }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "148mm",
          height: "210mm",
          margin: "0",
          padding: "0",
          backgroundColor: "#0b1220",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          color: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "10mm 10mm 0 10mm" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
              <div
                style={{
                  width: "9mm",
                  height: "9mm",
                  borderRadius: "2.5mm",
                  backgroundColor: "#06d6a0",
                }}
              />
              <div style={{ fontSize: "1.3rem", fontWeight: 900, letterSpacing: "0.03em" }}>QResolve</div>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700 }}>Scan → Report → Fix</div>
          </div>

          <div style={{ marginTop: "10mm", display: "flex", gap: "10mm", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontWeight: 800, letterSpacing: "0.08em" }}>ASSET</div>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, marginTop: "2mm", lineHeight: 1.05, color: "#e2e8f0" }}>
                {asset.name}
              </div>
              <div style={{ marginTop: "6mm", fontSize: "1rem", color: "#cbd5e1", fontWeight: 700 }}>
                Location: <span style={{ color: "#e2e8f0", fontWeight: 900 }}>{asset.location || "Not specified"}</span>
              </div>
              <div style={{ marginTop: "8mm", display: "grid", gap: "3mm" }}>
                <div style={{ display: "flex", gap: "3mm", alignItems: "center" }}>
                  <div style={{ width: "6mm", height: "6mm", borderRadius: "9999px", backgroundColor: "#06d6a0" }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>Scan the QR</div>
                </div>
                <div style={{ display: "flex", gap: "3mm", alignItems: "center" }}>
                  <div style={{ width: "6mm", height: "6mm", borderRadius: "9999px", backgroundColor: "#22c55e", opacity: 0.9 }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>Select the issue</div>
                </div>
                <div style={{ display: "flex", gap: "3mm", alignItems: "center" }}>
                  <div style={{ width: "6mm", height: "6mm", borderRadius: "9999px", backgroundColor: "#38bdf8", opacity: 0.9 }} />
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>We’ll fix it fast</div>
                </div>
              </div>
            </div>

            <div style={{ width: "70mm", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "70mm",
                  height: "70mm",
                  borderRadius: "6mm",
                  backgroundColor: "#ffffff",
                  padding: "3mm",
                  boxSizing: "border-box",
                  border: "3px solid #0f172a",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <QRCodeSVG value={qrUrl} size={240} level="H" style={{ width: "100%", height: "100%" }} />
              </div>
              <div style={{ marginTop: "4mm", fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700 }}>Takes less than 10 seconds</div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            backgroundColor: "#06d6a0",
            color: "#0b1220",
            padding: "6mm 10mm",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8mm",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "0.02em" }}>Powered by QResolve</div>
          <div style={{ fontSize: "0.8rem", fontWeight: 800 }}>ID: {asset.id}</div>
        </div>
      </div>
    );
  }
);

AssetQRPDFTemplateBold.displayName = "AssetQRPDFTemplateBold";

