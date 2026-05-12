"use client";

import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis } from "recharts";
import Ga4PendingCard from "../Ga4PendingCard";

interface DeviceData {
  device: string;
  sessions: number;
}

interface DeviceChartProps {
  data: DeviceData[] | null;
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: "#C8962A",
  desktop: "#34d399",
  tablet: "#60a5fa",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { device: string } }> }) => {
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
      <p style={{ color: "#fff", margin: 0 }}>{payload[0].value.toLocaleString()} sessions</p>
    </div>
  );
};

export default function DeviceChart({ data }: DeviceChartProps) {
  if (!data || data.length === 0) {
    return <Ga4PendingCard height={120} />;
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
        <XAxis
          dataKey="device"
          tick={{ fill: "rgba(160,170,186,0.6)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="sessions" radius={[3, 3, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={DEVICE_COLORS[entry.device.toLowerCase()] ?? "#94a3b8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
