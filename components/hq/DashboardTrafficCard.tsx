"use client";

import dynamic from "next/dynamic";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

interface TrendPoint { date: string; pageviews: number; sessions: number }

const TrafficChart = dynamic(
  () => import("@/components/hq/analytics/charts/TrafficChart"),
  { ssr: false, loading: () => <div style={{ height: 160 }} /> }
);

export default function DashboardTrafficCard({ trend }: { trend: TrendPoint[] | null }) {
  const hasData = !!(trend && trend.length > 0);
  return (
    <div
      style={{
        background: "rgba(8,22,40,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 20px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span
          className="font-sans"
          style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: HQ_TEXT.muted }}
        >
          Traffic Overview
        </span>
        <span
          className="font-sans"
          style={{
            fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "3px 8px",
            background: hasData ? "rgba(52,211,153,0.08)" : HQ_GOLD.bgTint,
            border: `1px solid ${hasData ? "rgba(52,211,153,0.2)" : HQ_GOLD.border}`,
            color: hasData ? "#34d399" : HQ_GOLD.dim,
          }}
        >
          {hasData ? "Live" : "Pending Connection"}
        </span>
      </div>
      <TrafficChart data={trend} />
    </div>
  );
}
