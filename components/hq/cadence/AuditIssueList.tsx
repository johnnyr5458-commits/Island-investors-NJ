"use client";

import Link from "next/link";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import type { AuditIssue, AuditIssueSeverity } from "@/lib/supabase/types";

const SEVERITY_CONFIG: Record<AuditIssueSeverity, { label: string; bg: string; text: string; border: string }> = {
  critical: { label: "Critical", bg: "rgba(239,68,68,0.12)", text: "rgba(252,165,165,0.90)", border: "rgba(239,68,68,0.25)" },
  warning:  { label: "Warning",  bg: "rgba(200,150,42,0.12)", text: HQ_GOLD.bright, border: HQ_GOLD.border },
  info:     { label: "Info",     bg: "rgba(255,255,255,0.05)", text: HQ_TEXT.muted, border: "rgba(255,255,255,0.10)" },
};

const TYPE_LABELS: Record<string, string> = {
  incomplete_entity_reference: "Incomplete Entity Reference",
  context_chain_gap:           "Relationship Chain Gap",
  orphaned_event:              "Orphaned Entity",
  stale_entity:                "Stale Entity",
  duplicate_event_risk:        "Duplicate Event Risk",
  singleton_timeline:          "Singleton Timeline",
  missing_vault_note:          "Missing Vault Note",
};

function IssueRow({ issue }: { issue: AuditIssue }) {
  const sev = SEVERITY_CONFIG[issue.severity];
  const typeLabel = TYPE_LABELS[issue.type] ?? issue.type;

  const entityMemoryHref =
    issue.entity_type && issue.entity_id
      ? `/hq/dashboard/cadence/retrieve?type=entity_memory&entity_type=${encodeURIComponent(issue.entity_type)}&entity_id=${encodeURIComponent(issue.entity_id)}`
      : null;

  return (
    <div
      className="px-4 py-3.5 border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Severity badge */}
        <span
          className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
          style={{ background: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}
        >
          {sev.label}
        </span>

        {/* Issue type */}
        <span className="text-[12px] font-sans font-medium" style={{ color: HQ_TEXT.secondary }}>
          {typeLabel}
        </span>

        {/* Entity chip */}
        {issue.entity_type && issue.entity_id && (
          entityMemoryHref ? (
            <Link
              href={entityMemoryHref}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.muted }}
            >
              {issue.entity_type}/{issue.entity_id}
            </Link>
          ) : (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.helper }}
            >
              {issue.entity_type}/{issue.entity_id}
            </span>
          )
        )}

        {/* Human review indicator */}
        {!issue.is_safe_to_repair && (
          <span
            className="text-[10px] font-sans uppercase tracking-wider"
            style={{ color: HQ_TEXT.disabled }}
          >
            human review required
          </span>
        )}
      </div>

      {/* Explanation */}
      <p className="text-[12px] font-sans leading-relaxed mb-1.5" style={{ color: HQ_TEXT.muted }}>
        {issue.explanation}
      </p>

      {/* Recommended action */}
      <p className="text-[12px] font-sans leading-relaxed" style={{ color: HQ_TEXT.helper }}>
        <span className="font-semibold" style={{ color: HQ_TEXT.secondary }}>Recommended: </span>
        {issue.recommended_action}
      </p>

      {/* Source refs */}
      {issue.source_refs.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {issue.source_refs.slice(0, 3).map(ref => (
            <span
              key={ref}
              className="font-mono text-[10px] px-1 py-0.5 rounded"
              style={{ background: "rgba(255,255,255,0.04)", color: HQ_TEXT.disabled }}
            >
              #{ref.split("-")[0]}
            </span>
          ))}
          {issue.source_refs.length > 3 && (
            <span className="text-[10px] font-sans" style={{ color: HQ_TEXT.disabled }}>
              +{issue.source_refs.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface AuditIssueListProps {
  issues: AuditIssue[];
}

export default function AuditIssueList({ issues }: AuditIssueListProps) {
  if (issues.length === 0) {
    return (
      <div
        className="rounded-sm border px-6 py-12 text-center"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
      >
        <p className="text-sm font-sans" style={{ color: HQ_TEXT.muted }}>
          No issues detected.
        </p>
        <p className="text-xs font-sans mt-1" style={{ color: HQ_TEXT.helper }}>
          Operational memory appears healthy.
        </p>
      </div>
    );
  }

  // Sort: critical first, then warning, then info
  const sorted = [...issues].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      <div
        className="px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-[10px] font-sans font-semibold uppercase tracking-widest" style={{ color: HQ_TEXT.muted }}>
          {issues.length} issue{issues.length !== 1 ? "s" : ""} detected
        </p>
      </div>
      {sorted.map(issue => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
