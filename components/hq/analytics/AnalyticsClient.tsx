"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import StatCard from "@/components/hq/StatCard";
import AnalyticsSkeleton from "./AnalyticsSkeleton";
import Ga4PendingCard from "./Ga4PendingCard";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

// Lazy-load chart components — excluded from SSR bundle
const TrafficChart = dynamic(() => import("./charts/TrafficChart"), {
  ssr: false,
  loading: () => <div style={{ height: 180, background: "rgba(255,255,255,0.02)", borderRadius: 2 }} />,
});
const SourcesChart = dynamic(() => import("./charts/SourcesChart"), {
  ssr: false,
  loading: () => <div style={{ height: 160, background: "rgba(255,255,255,0.02)", borderRadius: 2 }} />,
});
const DeviceChart = dynamic(() => import("./charts/DeviceChart"), {
  ssr: false,
  loading: () => <div style={{ height: 120, background: "rgba(255,255,255,0.02)", borderRadius: 2 }} />,
});

type Range = "today" | "7d" | "30d";

interface SubmissionData {
  seller: number;
  partner: number;
  conversionRate: null;
}

interface AnalyticsData {
  range: Range;
  ga4Configured: boolean;
  submissions: SubmissionData;
}

interface AnalyticsClientProps {
  initialData: AnalyticsData;
  initialRange: Range;
}

// Card wrapper matching HQ glassmorphism pattern
function GlassCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(8,22,40,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Gold top edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.35) 50%, transparent)",
        }}
      />
      <div style={{ padding: "16px 16px 4px" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: HQ_TEXT.muted,
            margin: "0 0 12px",
          }}
        >
          {title}
        </p>
      </div>
      <div style={{ padding: "0 16px 16px" }}>{children}</div>
    </div>
  );
}

// KPI icon components (inline SVG, minimal)
const icons = {
  views: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  visitors: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  sessions: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  seller: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  partner: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-4-4h-1" />
      <path d="M16 3a4 4 0 0 1 0 8" />
    </svg>
  ),
};

const RANGE_LABELS: Record<Range, string> = {
  today: "Today",
  "7d": "7 Days",
  "30d": "30 Days",
};

export default function AnalyticsClient({ initialData, initialRange }: AnalyticsClientProps) {
  const [range, setRange] = useState<Range>(initialRange);
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchRange = useCallback(async (newRange: Range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hq/analytics?range=${newRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // keep previous data on network error
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRangeChange = (newRange: Range) => {
    setRange(newRange);
    fetchRange(newRange);
  };

  const { submissions } = data;
  const totalInquiries = submissions.seller + submissions.partner;

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* Sticky range tab bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          background: "rgba(6,14,26,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {(["today", "7d", "30d"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => handleRangeChange(r)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              border: range === r ? `1px solid ${HQ_GOLD.border}` : "1px solid rgba(255,255,255,0.08)",
              background: range === r ? HQ_GOLD.bgTint : "transparent",
              color: range === r ? HQ_GOLD.bright : HQ_TEXT.muted,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}

        {/* Live dot */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {loading && (
            <div
              className="animate-spin"
              style={{
                width: 12,
                height: 12,
                border: "1.5px solid rgba(200,150,42,0.3)",
                borderTopColor: "#C8962A",
                borderRadius: "50%",
              }}
            />
          )}
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <span style={{ fontSize: 10, color: HQ_TEXT.helper, fontWeight: 600 }}>
            LIVE
          </span>
        </div>
      </div>

      {/* KPI stat strip */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "16px 16px 0",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* GA4 cards — pending */}
        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <StatCard label="Page Views" value="—" sub="Connect GA4" icon={icons.views} />
        </div>
        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <StatCard label="Unique Visitors" value="—" sub="Connect GA4" icon={icons.visitors} />
        </div>
        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <StatCard label="Sessions" value="—" sub="Connect GA4" icon={icons.sessions} />
        </div>

        {/* Supabase-powered cards — real data */}
        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <StatCard
            label="Seller Inquiries"
            value={submissions.seller.toString()}
            sub={RANGE_LABELS[range]}
            trend={submissions.seller > 0 ? "up" : "flat"}
            icon={icons.seller}
          />
        </div>
        <div style={{ minWidth: 140, flexShrink: 0 }}>
          <StatCard
            label="Partner Inquiries"
            value={submissions.partner.toString()}
            sub={RANGE_LABELS[range]}
            trend={submissions.partner > 0 ? "up" : "flat"}
            icon={icons.partner}
          />
        </div>
      </div>

      {/* Chart grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          padding: 16,
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <GlassCard title="Traffic Trend">
          <TrafficChart data={null} />
        </GlassCard>

        <GlassCard title="Traffic Sources">
          <SourcesChart data={null} />
        </GlassCard>

        <GlassCard title="Device Split">
          <DeviceChart data={null} />
        </GlassCard>

        {/* Conversion snapshot — real Supabase data */}
        <GlassCard title="Conversion Snapshot">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: HQ_TEXT.muted }}>Seller Inquiries</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display, serif)" }}>
                {submissions.seller}
              </span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: HQ_TEXT.muted }}>Partner Inquiries</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "var(--font-display, serif)" }}>
                {submissions.partner}
              </span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: HQ_TEXT.muted }}>Total Inquiries</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: HQ_GOLD.bright, fontFamily: "var(--font-display, serif)" }}>
                {totalInquiries}
              </span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: HQ_TEXT.muted }}>Conv. Rate</span>
              <span style={{ fontSize: 13, color: HQ_TEXT.disabled, fontStyle: "italic" }}>
                — (requires GA4)
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Lists grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
          padding: "0 16px 16px",
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <GlassCard title="Top Pages">
          <Ga4PendingCard height={160} label="Top performing pages will appear here after GA4 is connected" />
        </GlassCard>

        <GlassCard title="Geographic Focus">
          <Ga4PendingCard height={160} label="Traffic by region — Atlantic County and beyond" />
        </GlassCard>
      </div>

      {/* GA4 setup callout */}
      <div style={{ padding: "0 16px 16px" }}>
        <div
          style={{
            background: "rgba(200,150,42,0.06)",
            border: "1px solid rgba(200,150,42,0.18)",
            borderRadius: 2,
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke={HQ_GOLD.dim}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: HQ_GOLD.text, margin: "0 0 2px", letterSpacing: "0.04em" }}>
              GA4 Data API — Not Connected
            </p>
            <p style={{ fontSize: 10, color: HQ_TEXT.helper, margin: 0, lineHeight: 1.6 }}>
              Traffic, visitor, and device data require a Google Cloud service account. Once connected, all pending charts activate automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
