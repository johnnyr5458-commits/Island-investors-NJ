import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import ActivityFeed from "@/components/hq/cadence/ActivityFeed";
import type { CadenceEvent } from "@/lib/supabase/types";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

export const metadata = { title: "Cadence — Island Investors HQ" };

export default async function CadencePage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("cadence_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(50);

  const events = (data ?? []) as CadenceEvent[];

  const highCount = events.filter(e => e.importance === "high").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = events.filter(e => new Date(e.timestamp) >= today).length;

  return (
    <>
      <TopBar title="Cadence" subtitle="Operational activity feed — what happened, when, and why it matters" />
      <main className="flex-1 p-6 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div
            className="rounded-sm border px-4 py-3.5"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(192,182,158,0.84)" }}>
              Total Events
            </p>
            <p className="text-2xl font-sans font-bold" style={{ color: "rgba(242,236,218,0.95)" }}>
              {events.length}
            </p>
            <p className="text-[11px] font-sans mt-0.5" style={{ color: "rgba(168,158,132,0.74)" }}>
              Last 50 recorded
            </p>
          </div>

          <div
            className="rounded-sm border px-4 py-3.5"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(192,182,158,0.84)" }}>
              Today
            </p>
            <p className="text-2xl font-sans font-bold" style={{ color: "rgba(242,236,218,0.95)" }}>
              {todayCount}
            </p>
            <p className="text-[11px] font-sans mt-0.5" style={{ color: "rgba(168,158,132,0.74)" }}>
              Events since midnight ET
            </p>
          </div>

          <div
            className="rounded-sm border px-4 py-3.5"
            style={{ borderColor: "rgba(200,150,42,0.20)", background: "rgba(200,150,42,0.06)" }}
          >
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(215,168,58,0.92)" }}>
              High Priority
            </p>
            <p className="text-2xl font-sans font-bold" style={{ color: "rgba(232,186,76,0.96)" }}>
              {highCount}
            </p>
            <p className="text-[11px] font-sans mt-0.5" style={{ color: "rgba(200,152,42,0.80)" }}>
              Leads & publishes
            </p>
          </div>
        </div>

        {/* Cadence tool links */}
        <div className="flex justify-end gap-3">
          <Link
            href="/hq/dashboard/cadence/audit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors"
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              color: HQ_TEXT.muted,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            Audit
          </Link>
          <Link
            href="/hq/dashboard/cadence/retrieve"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors"
            style={{
              borderColor: HQ_GOLD.border,
              color: HQ_GOLD.text,
              background: HQ_GOLD.bgTint,
            }}
          >
            Query Memory →
          </Link>
        </div>

        {/* Activity feed */}
        <ActivityFeed events={events} />

      </main>
    </>
  );
}
