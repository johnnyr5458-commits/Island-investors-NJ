"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Ga4PendingCard from "../Ga4PendingCard";

interface SourceData {
  channel: string;
  sessions: number;
}

interface SourcesChartProps {
  data: SourceData[] | null;
  emptyLabel?: string;
}

const COLORS = ["#C8962A", "#34d399", "#60a5fa", "#a78bfa"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { channel: string } }> }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      style={{
        background: "rgba(6,14,26,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 11,
      }}
    >
      <p style={{ color: "rgba(200,150,42,0.9)", margin: "0 0 2px", fontWeight: 600 }}>{name}</p>
      <p style={{ color: "#fff", margin: 0 }}>{value.toLocaleString()} sessions</p>
    </div>
  );
};

export default function SourcesChart({ data, emptyLabel }: SourcesChartProps) {
  if (data === null) {
    return <Ga4PendingCard height={160} />;
  }
  if (data.length === 0) {
    return <Ga4PendingCard height={160} label={emptyLabel ?? "No traffic data for this period"} />;
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sessions"
          nameKey="channel"
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="80%"
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
