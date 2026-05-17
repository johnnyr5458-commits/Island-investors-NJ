import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { runAudit } from "@/lib/cadence-audit";
import { logEvent } from "@/lib/cadence";

function authorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  return !!secret && token === secret;
}

export async function GET(req: NextRequest) {
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Not configured", hint: "ANALYTICS_CRON_SECRET and CRON_SECRET are both unset" },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runAudit("scheduled");

    const admin = createAdminClient();
    await admin.from("cadence_audit_reports").insert({
      id:           report.id,
      ran_at:       report.ran_at,
      triggered_by: report.triggered_by,
      duration_ms:  report.duration_ms,
      issue_count:  report.issues.length,
      health_score: report.summary.health_score,
      summary:      report.summary,
      issues:       report.issues,
    });

    console.log(
      "[cadence-audit] Scheduled audit complete — health: %d, issues: %d, duration: %dms",
      report.summary.health_score,
      report.issues.length,
      report.duration_ms,
    );

    return NextResponse.json({
      ok:           true,
      health_score: report.summary.health_score,
      issue_count:  report.issues.length,
      duration_ms:  report.duration_ms,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cadence-audit] Cron failed:", err);

    logEvent({
      type:    "system.cron_failure",
      source:  "cron",
      summary: `cadence-audit cron failed: ${message}`,
      importance: "high",
      metadata: { cron: "cadence-audit", error: message },
    });

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
