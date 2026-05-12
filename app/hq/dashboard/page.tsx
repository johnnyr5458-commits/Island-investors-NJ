import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import StatCard from "@/components/hq/StatCard";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="p-5 h-52 flex flex-col"
      style={{
        background: "rgba(8,22,40,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: HQ_TEXT.muted }}>{label}</span>
        <span
          className="font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-1"
          style={{ background: HQ_GOLD.bgTint, border: `1px solid ${HQ_GOLD.border}`, color: HQ_GOLD.dim }}
        >
          Pending Connection
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(200,150,42,0.06)", border: "1px solid rgba(200,150,42,0.12)" }}>
            <svg className="w-5 h-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: HQ_GOLD.dim }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="font-sans text-[11px]" style={{ color: HQ_TEXT.helper }}>Connect your data source to activate</p>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ time, text, type }: { time: string; text: string; type: "lead" | "partner" | "system" }) {
  const dot = type === "lead" ? "#34d399" : type === "partner" ? HQ_GOLD.text : "#64748b";
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
      <div className="flex-1 min-w-0">
        <p className="font-sans text-xs leading-relaxed" style={{ color: HQ_TEXT.secondary }}>{text}</p>
        <p className="font-sans text-[10px] mt-0.5" style={{ color: HQ_TEXT.helper }}>{time}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { data: { user } },
    submissions,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getSubmissionCounts("7d"),
  ]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user!.id)
    .single() as { data: { name: string | null; role: string } | null; error: unknown };

  const { count: activePartners } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "partner")
    .eq("status", "active");

  const { count: totalPartners } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "partner");

  const greeting = profile?.name ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome back";

  return (
    <>
      <TopBar title="Dashboard" subtitle={greeting} />
      <main className="flex-1 p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Website Visits"
            value="—"
            sub="Connect GA4 to activate"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <StatCard
            label="Leads Received"
            value={String(submissions.seller)}
            sub="Seller leads — last 7 days"
            trend={submissions.seller > 0 ? "up" : "flat"}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
          />
          <StatCard
            label="Active Partners"
            value={activePartners?.toString() ?? "0"}
            sub={`${totalPartners ?? 0} total in system`}
            trend="flat"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <StatCard
            label="Conversion Rate"
            value="—"
            sub="Requires analytics integration"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartPlaceholder label="Traffic Overview" />
          <ChartPlaceholder label="Lead Flow" />
        </div>

        {/* Activity + quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent activity */}
          <div
            className="lg:col-span-2 p-5"
            style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: HQ_TEXT.muted }}>Recent Activity</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <ActivityItem time="Just now" text="System initialized — HQ is live and operational." type="system" />
            <ActivityItem time="Ready" text="Partner management module is active." type="partner" />
            <ActivityItem time="Pending" text="Lead sync — connect Formspree webhook to populate." type="lead" />
            <ActivityItem time="Pending" text="Analytics module — connect GA4 data API to populate." type="system" />
          </div>

          {/* Quick actions */}
          <div
            className="p-5"
            style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="font-sans text-xs font-semibold uppercase tracking-wider block mb-4" style={{ color: HQ_TEXT.muted }}>Quick Actions</span>
            <div className="space-y-2">
              {[
                { label: "View Leads", href: "/hq/dashboard/leads" },
                { label: "Manage Partners", href: "/hq/dashboard/partners" },
                { label: "Write Blog Post", href: "/hq/dashboard/blogs" },
                { label: "View Analytics", href: "/hq/dashboard/analytics" },
                { label: "Settings", href: "/hq/dashboard/settings" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="block w-full text-left px-3 py-2.5 font-sans text-xs transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    color: HQ_TEXT.secondary,
                  }}
                >
                  {label} →
                </a>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
