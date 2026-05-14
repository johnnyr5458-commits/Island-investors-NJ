import { createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import CadenceAuditClient from "@/components/hq/cadence/CadenceAuditClient";
import type { AuditReport } from "@/lib/supabase/types";

export const metadata = { title: "Audit — Island Investors HQ" };

export default async function CadenceAuditPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cadence_audit_reports")
    .select("*")
    .order("ran_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialReport: AuditReport | null = data
    ? {
        id:           data.id,
        ran_at:       data.ran_at,
        triggered_by: data.triggered_by as AuditReport["triggered_by"],
        duration_ms:  data.duration_ms,
        issues:       data.issues as AuditReport["issues"],
        summary:      data.summary as AuditReport["summary"],
      }
    : null;

  return (
    <>
      <TopBar
        title="Audit"
        subtitle="Operational memory integrity and organizational health"
      />
      <main className="flex-1 p-6">
        <CadenceAuditClient initialReport={initialReport} />
      </main>
    </>
  );
}
