"use client";

import { formatDistanceToNow } from "date-fns";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import type { AuditReport } from "@/lib/supabase/types";

const SEVERITY_COLORS = {
  critical: { bg: "rgba(239,68,68,0.12)", text: "rgba(252,165,165,0.90)", border: "rgba(239,68,68,0.25)" },
  warning:  { bg: "rgba(200,150,42,0.12)", text: HQ_GOLD.bright, border: HQ_GOLD.border },
  info:     { bg: "rgba(255,255,255,0.04)", text: HQ_TEXT.muted, border: "rgba(255,255,255,0.08)" },
} as const;

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90 ? "rgba(52,211,153,0.90)" :
    score >= 70 ? HQ_GOLD.bright :
    "rgba(252,165,165,0.90)";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-4">
      <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-2" style={{ color: HQ_TEXT.muted }}>
        Health Score
      </p>
      <p className="text-5xl font-sans font-bold tabular-nums" style={{ color }}>
        {score}
      </p>
      <p className="text-[11px] font-sans mt-1" style={{ color: HQ_TEXT.helper }}>
        / 100
      </p>
    </div>
  );
}

function StatCard({ label, value, dim = false }: { label: string; value: number; dim?: boolean }) {
  return (
    <div
      className="flex flex-col px-4 py-3 rounded-sm border"
      style={{
        borderColor: value > 0 && !dim ? "rgba(200,150,42,0.20)" : "rgba(255,255,255,0.06)",
        background: value > 0 && !dim ? "rgba(200,150,42,0.06)" : "rgba(255,255,255,0.02)",
      }}
    >
      <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: HQ_TEXT.muted }}>
        {label}
      </p>
      <p className="text-xl font-sans font-bold tabular-nums" style={{ color: value > 0 ? HQ_GOLD.bright : HQ_TEXT.disabled }}>
        {value}
      </p>
    </div>
  );
}

interface AuditSummaryProps {
  report: AuditReport;
}

export default function AuditSummary({ report }: AuditSummaryProps) {
  const { summary, issues, ran_at, duration_ms } = report;

  const criticalCount = issues.filter(i => i.severity === "critical").length;
  const warningCount  = issues.filter(i => i.severity === "warning").length;
  const infoCount     = issues.filter(i => i.severity === "info").length;

  const ranAgo = formatDistanceToNow(new Date(ran_at), { addSuffix: true });

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      {/* Header row */}
      <div
        className="px-4 py-2.5 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-[10px] font-sans font-semibold uppercase tracking-widest" style={{ color: HQ_TEXT.muted }}>
          Audit Report
        </p>
        <p className="text-[11px] font-sans" style={{ color: HQ_TEXT.helper }}>
          {ranAgo} · {duration_ms}ms · {summary.total_events} events · {summary.total_contexts} contexts
        </p>
      </div>

      {/* Score + severity overview */}
      <div className="flex items-stretch border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <ScoreRing score={summary.health_score} />
        </div>

        <div className="flex-1 grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {(["critical", "warning", "info"] as const).map(sev => {
            const count = sev === "critical" ? criticalCount : sev === "warning" ? warningCount : infoCount;
            const colors = SEVERITY_COLORS[sev];
            return (
              <div
                key={sev}
                className="flex flex-col items-center justify-center py-4 border-r last:border-r-0"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span
                  className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-2"
                  style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  {sev}
                </span>
                <p className="text-2xl font-sans font-bold tabular-nums" style={{ color: count > 0 ? colors.text : HQ_TEXT.disabled }}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed stat grid */}
      <div className="p-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
        <StatCard label="Entities"        value={summary.total_entities}        dim />
        <StatCard label="Orphaned"        value={summary.orphaned_events} />
        <StatCard label="Stale"           value={summary.stale_entities} />
        <StatCard label="Chain Gaps"      value={summary.context_chain_gaps} />
        <StatCard label="Duplicates"      value={summary.duplicate_event_risks} />
        <StatCard label="Singletons"      value={summary.singleton_timelines} />
        <StatCard label="Missing Vault"   value={summary.missing_vault_notes} />
        <StatCard label="Broken Refs"     value={summary.incomplete_refs} />
      </div>
    </div>
  );
}
