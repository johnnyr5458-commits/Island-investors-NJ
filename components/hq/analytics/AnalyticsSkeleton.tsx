"use client";

function ShimmerCard({ height = 80 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        background: "rgba(8,22,40,0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="animate-pulse"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default function AnalyticsSkeleton() {
  return (
    <div style={{ padding: "0 0 80px" }}>
      {/* Range tab bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          background: "rgba(6,14,26,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {[60, 50, 60].map((w, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{ width: w, height: 32, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}
          />
        ))}
      </div>

      {/* KPI strip */}
      <div style={{ padding: "16px 16px 0", display: "flex", gap: 12, overflowX: "auto" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ minWidth: 140, flexShrink: 0 }}>
            <ShimmerCard height={96} />
          </div>
        ))}
      </div>

      {/* Chart grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          padding: 16,
        }}
      >
        <ShimmerCard height={230} />
        <ShimmerCard height={230} />
        <ShimmerCard height={190} />
        <ShimmerCard height={190} />
      </div>

      {/* Lists */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          padding: "0 16px 16px",
        }}
      >
        <ShimmerCard height={200} />
        <ShimmerCard height={200} />
      </div>
    </div>
  );
}
