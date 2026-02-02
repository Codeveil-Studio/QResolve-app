import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Asset } from "@/lib/supabase-types";

interface AssetQRPDFTemplateProps {
  asset: Asset;
  qrUrl: string;
}

export const AssetQRPDFTemplate = React.forwardRef<HTMLDivElement, AssetQRPDFTemplateProps>(
  ({ asset, qrUrl }, ref) => {
    return (
      <div
        ref={ref}
        id={`qr-template-${asset.id}`}
        style={{
          width: "210mm",
          height: "296mm",
          margin: "0",
          padding: "6mm",
          background: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)",
          fontFamily: "Inter, Arial, sans-serif",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          color: "#0f172a",
          fontSize: "12px"
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "6mm",
            border: "1px solid #e2e8f0",
            padding: "6mm",
            display: "flex",
            flexDirection: "column",
            gap: "6mm",
            height: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
              <div style={{ width: "12mm", height: "12mm", borderRadius: "4mm", backgroundColor: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "10pt" }}>
                QR
              </div>
              <div>
                <div style={{ fontSize: "18pt", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>QResolve</div>
                <div style={{ fontSize: "9pt", color: "#2563eb", fontWeight: 600, lineHeight: 1.1 }}>Asset issue reporting</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "9pt", fontWeight: 700, color: "#1d4ed8", lineHeight: 1.2 }}>Scan & resolve</div>
              <div style={{ fontSize: "8pt", color: "#64748b", lineHeight: 1.2 }}>Takes less than 10 seconds</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            <div style={{ fontSize: "26pt", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>See it. Scan it.</div>
            <div style={{ fontSize: "26pt", fontWeight: 800, color: "#2563eb", lineHeight: 1.1 }}>Fix it together.</div>
            <div style={{ fontSize: "10pt", color: "#475569", lineHeight: 1.4, maxWidth: "150mm" }}>
              Report issues instantly to keep equipment safe, available, and running smoothly for everyone.
            </div>
          </div>
          <div style={{ display: "flex", gap: "6mm", alignItems: "stretch" }}>
            <div style={{ flex: 1, borderRadius: "4mm", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", padding: "4mm", display: "flex", flexDirection: "column", gap: "3mm" }}>
              <div style={{ fontSize: "14pt", fontWeight: 800, color: "#1d4ed8" }}>Quick steps</div>
              {[
                "Scan the QR code on the asset",
                "Select the issue and add a short note",
                "Submit and we will handle the rest"
              ].map((step) => (
                <div key={step} style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "14pt", color: "#0f172a", fontWeight: 600, lineHeight: 1.3 }}>{step}</div>
                </div>
              ))}
            </div>
            <div style={{ width: "72mm", backgroundColor: "#eff6ff", borderRadius: "4mm", border: "2px solid #2563eb", padding: "4mm", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3mm" }}>
              <div style={{ width: "62mm", height: "62mm", borderRadius: "4mm", backgroundColor: "#ffffff", border: "2px dashed #2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QRCodeSVG value={qrUrl} size={210} level="H" includeMargin />
              </div>
              <div style={{ fontSize: "9pt", fontWeight: 700, color: "#1d4ed8", textAlign: "center" }}>Scan to report this asset</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "4mm" }}>
            <div style={{ flex: 1, borderRadius: "3mm", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "3mm" }}>
              <div style={{ fontSize: "7pt", color: "#64748b", fontWeight: 700, marginBottom: "1.5mm" }}>Asset</div>
              <div style={{ fontSize: "11pt", fontWeight: 700, color: "#0f172a" }}>{asset.name}</div>
              <div style={{ fontSize: "8pt", color: "#475569" }}>ID: {asset.id}</div>
            </div>
            <div style={{ width: "60mm", borderRadius: "3mm", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "3mm" }}>
              <div style={{ fontSize: "7pt", color: "#64748b", fontWeight: 700, marginBottom: "1.5mm" }}>Location</div>
              <div style={{ fontSize: "10pt", fontWeight: 600, color: "#0f172a" }}>{asset.location || "Not specified"}</div>
            </div>
            <div style={{ width: "44mm", borderRadius: "3mm", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "3mm" }}>
              <div style={{ fontSize: "7pt", color: "#64748b", fontWeight: 700, marginBottom: "1.5mm" }}>Status</div>
              <div style={{ fontSize: "10pt", fontWeight: 600, color: "#0f172a" }}>{asset.status}</div>
            </div>
          </div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: "3mm" }}>
            <div style={{ fontSize: "9pt", fontWeight: 700, color: "#1d4ed8" }}>Powered by QResolve</div>
            <div style={{ fontSize: "9pt", color: "#64748b", fontWeight: 600 }}>Reliable assets, faster fixes</div>
          </div>
        </div>
      </div>
    );
  }
);

AssetQRPDFTemplate.displayName = "AssetQRPDFTemplate";

export function generateAssetQRPDFHTML(
  asset: Asset,
  qrCodeDataUrl: string
): string {
  return `
   <div style="width: 210mm; height: 296mm; margin: 0; padding: 6mm; background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%); font-family: Inter, Arial, sans-serif; box-sizing: border-box; display: flex; flex-direction: column; color: #0f172a; font-size: 12px;">
    <div style="background-color: #ffffff; border-radius: 6mm; border: 1px solid #e2e8f0; padding: 6mm; display: flex; flex-direction: column; gap: 6mm; height: 100%;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 3mm;">
          <div style="width: 12mm; height: 12mm; border-radius: 4mm; background-color: #2563eb; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 10pt;">QR</div>
          <div>
            <div style="font-size: 18pt; font-weight: 800; color: #0f172a; line-height: 1.1;">QResolve</div>
            <div style="font-size: 9pt; color: #2563eb; font-weight: 600; line-height: 1.1;">Asset issue reporting</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9pt; font-weight: 700; color: #1d4ed8; line-height: 1.2;">Scan & resolve</div>
          <div style="font-size: 8pt; color: #64748b; line-height: 1.2;">Takes less than 10 seconds</div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 2mm;">
        <div style="font-size: 26pt; font-weight: 800; color: #0f172a; line-height: 1.1;">See it. Scan it.</div>
        <div style="font-size: 26pt; font-weight: 800; color: #2563eb; line-height: 1.1;">Fix it together.</div>
        <div style="font-size: 10pt; color: #475569; line-height: 1.4; max-width: 150mm;">
          Report issues instantly to keep equipment safe, available, and running smoothly for everyone.
        </div>
      </div>
      <div style="display: flex; gap: 6mm; align-items: stretch;">
        <div style="flex: 1; border-radius: 4mm; border: 1px solid #e2e8f0; background-color: #ffffff; padding: 4mm; display: flex; flex-direction: column; gap: 3mm;">
          <div style="font-size: 10pt; font-weight: 800; color: #1d4ed8;">Quick steps</div>
          <div style="display: flex; align-items: flex-start;">
            <div style="font-size: 10pt; color: #0f172a; font-weight: 600; line-height: 1.3;">Scan the QR code on the asset</div>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <div style="font-size: 10pt; color: #0f172a; font-weight: 600; line-height: 1.3;">Select the issue and add a short note</div>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <div style="font-size: 10pt; color: #0f172a; font-weight: 600; line-height: 1.3;">Submit and we will handle the rest</div>
          </div>
        </div>
        <div style="width: 72mm; background-color: #eff6ff; border-radius: 4mm; border: 2px solid #2563eb; padding: 4mm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3mm;">
          <div style="width: 62mm; height: 62mm; border-radius: 4mm; background-color: #ffffff; border: 2px dashed #2563eb; display: flex; align-items: center; justify-content: center;">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 56mm; height: 56mm; object-fit: contain;" />
          </div>
          <div style="font-size: 9pt; font-weight: 700; color: #1d4ed8; text-align: center;">Scan to report this asset</div>
        </div>
      </div>
      <div style="display: flex; gap: 4mm;">
        <div style="flex: 1; border-radius: 3mm; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 3mm;">
          <div style="font-size: 7pt; color: #64748b; font-weight: 700; margin-bottom: 1.5mm;">Asset</div>
          <div style="font-size: 11pt; font-weight: 700; color: #0f172a;">${asset.name}</div>
          <div style="font-size: 8pt; color: #475569;">ID: ${asset.id}</div>
        </div>
        <div style="width: 60mm; border-radius: 3mm; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 3mm;">
          <div style="font-size: 7pt; color: #64748b; font-weight: 700; margin-bottom: 1.5mm;">Location</div>
          <div style="font-size: 10pt; font-weight: 600; color: #0f172a;">${asset.location || "Not specified"}</div>
        </div>
        <div style="width: 44mm; border-radius: 3mm; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 3mm;">
          <div style="font-size: 7pt; color: #64748b; font-weight: 700; margin-bottom: 1.5mm;">Status</div>
          <div style="font-size: 10pt; font-weight: 600; color: #0f172a;">${asset.status}</div>
        </div>
      </div>
      <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 3mm;">
        <div style="font-size: 9pt; font-weight: 700; color: #1d4ed8;">Powered by QResolve</div>
        <div style="font-size: 9pt; color: #64748b; font-weight: 600;">Reliable assets, faster fixes</div>
      </div>
    </div>
  </div>
  `;
}
