interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
  icon: React.ReactNode;
}

export default function StatCard({ label, value, sub, trend, icon }: StatCardProps) {
  const trendColor = trend === "up" ? "#34d399" : trend === "down" ? "#f87171" : "#94a3b8";
  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "–";

  return (
    <div
      className="relative overflow-hidden p-5"
      style={{
        background: "rgba(8,22,40,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      {/* Gold top edge */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.35) 50%, transparent)" }} />

      <div className="flex items-start justify-between mb-3">
        <div className="text-silver-600" style={{ opacity: 0.7 }}>{icon}</div>
        {trend && (
          <span className="font-sans text-[10px] font-bold" style={{ color: trendColor }}>
            {trendSymbol}
          </span>
        )}
      </div>

      <div className="font-display text-3xl font-bold text-white mb-1">{value}</div>
      <div className="font-sans text-[11px] font-semibold uppercase tracking-wider text-silver-600">{label}</div>
      {sub && <div className="font-sans text-[10px] text-silver-700 mt-1">{sub}</div>}
    </div>
  );
}
