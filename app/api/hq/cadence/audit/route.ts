import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { runAudit } from "@/lib/cadence-audit";
import type { AuditReport } from "@/lib/supabase/types";

async function requireHQAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string } | null; error: unknown };
  if (!profile || profile.status !== "active" || !["admin", "team"].includes(profile.role)) return null;
  return user;
}

// GET — return latest stored audit report
export async function GET() {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("cadence_audit_reports")
    .select("*")
    .order("ran_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return NextResponse.json({ report: null });

  const report: AuditReport = {
    id: data.id,
    ran_at: data.ran_at,
    triggered_by: data.triggered_by,
    duration_ms: data.duration_ms,
    issues: data.issues as AuditReport["issues"],
    summary: data.summary as AuditReport["summary"],
  };

  return NextResponse.json({ report });
}

// POST — run audit, persist, return report
export async function POST(req: NextRequest) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let triggeredBy: "manual" | "scheduled" | "system" = "manual";
  try {
    const body = await req.json() as { triggered_by?: string };
    if (body.triggered_by === "scheduled" || body.triggered_by === "system") {
      triggeredBy = body.triggered_by;
    }
  } catch {
    // no body or invalid JSON — default to manual
  }

  const report = await runAudit(triggeredBy);

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

  return NextResponse.json({ report });
}
