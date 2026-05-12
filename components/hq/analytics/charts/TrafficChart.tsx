"use client";

import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Ga4PendingCard from "../Ga4PendingCard";

interface DataPoint {
  date: string;
  pageviews: number;
  sessions: number;
}

interface TrafficChartProps {
  data: DataPoint[] | null;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
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
      <p style={{ color: "rgba(160,170,186,0.7)", margin: "0 0 4px", fontSize: 10 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: "2px 0", fontWeight: 600 }}>
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function TrafficChart({ data }: TrafficChartProps) {
  if (!data || data.length === 0) {
    return <Ga4PendingCard height={180} />;
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="pageviews"
          name="Page Views"
          stroke="#C8962A"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#C8962A" }}
        />
        <Line
          type="monotone"
          dataKey="sessions"
          name="Sessions"
          stroke="#34d399"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#34d399" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
