"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuditSummary from "@/components/hq/cadence/AuditSummary";
import AuditIssueList from "@/components/hq/cadence/AuditIssueList";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import type { AuditReport } from "@/lib/supabase/types";

function RunAuditButton({ onComplete }: { onComplete: (report: AuditReport) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hq/cadence/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggered_by: "manual" }),
      });
      const data = await res.json() as { report?: AuditReport; error?: string };
      if (!res.ok || !data.report) {
        setError(data.error ?? "Audit failed. Check server logs.");
      } else {
        onComplete(data.report);
      }
    } catch {
      setError("Network error. Unable to reach audit service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {error && (
        <p className="text-[11px] font-sans" style={{ color: "rgba(252,165,165,0.80)" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleRun}
        disabled={loading}
        className="px-5 py-2 rounded-sm text-[12px] font-sans font-semibold uppercase tracking-wider transition-opacity"
        style={{
          background: loading ? "rgba(200,150,42,0.14)" : "rgba(200,150,42,0.18)",
          color: loading ? HQ_GOLD.dim : HQ_GOLD.bright,
          border: `1px solid ${HQ_GOLD.border}`,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Running Audit…" : "Run Audit"}
      </button>
    </div>
  );
}

interface CadenceAuditClientProps {
  initialReport: AuditReport | null;
}

export default function CadenceAuditClient({ initialReport }: CadenceAuditClientProps) {
  const [report, setReport] = useState<AuditReport | null>(initialReport);
  const router = useRouter();

  function handleAuditComplete(newReport: AuditReport) {
    setReport(newReport);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-sans" style={{ color: HQ_TEXT.helper }}>
          Scans events, relationships, entity timelines, and vault notes for structural issues.
        </p>
        <RunAuditButton onComplete={handleAuditComplete} />
      </div>

      {/* Report or empty state */}
      {report ? (
        <>
          <AuditSummary report={report} />
          <AuditIssueList issues={report.issues} />
        </>
      ) : (
        <div
          className="rounded-sm border px-6 py-12 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-sm font-sans" style={{ color: HQ_TEXT.muted }}>
            No audit has been run yet.
          </p>
          <p className="text-xs font-sans mt-1" style={{ color: HQ_TEXT.helper }}>
            Run an audit to inspect operational memory for structural issues.
          </p>
        </div>
      )}
    </div>
  );
}
