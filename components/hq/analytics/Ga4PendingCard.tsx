"use client";

import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

interface Ga4PendingCardProps {
  height?: number;
  label?: string;
}

export default function Ga4PendingCard({ height = 180, label = "Connect GA4 Data API to activate" }: Ga4PendingCardProps) {
  return (
    <div
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: HQ_GOLD.bgTint,
          border: `1px solid ${HQ_GOLD.border}`,
          borderRadius: 20,
          padding: "4px 10px",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: HQ_GOLD.dim,
            display: "inline-block",
            animation: "pulse 2s infinite",
          }}
        />
        <span style={{ fontSize: 10, fontWeight: 700, color: HQ_GOLD.dim, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Pending Connection
        </span>
      </div>
      <p style={{ fontSize: 11, color: HQ_TEXT.helper, textAlign: "center", margin: 0, maxWidth: 180 }}>
        {label}
      </p>
    </div>
  );
}
