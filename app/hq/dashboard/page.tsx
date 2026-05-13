import { createClient, createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import StatCard from "@/components/hq/StatCard";
import DashboardTrafficCard from "@/components/hq/DashboardTrafficCard";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";
import { ga4IsConfigured, getGa4Overview } from "@/lib/ga4";

type LeadRow = {
  id: string;
  name: string;
  address: string;
  status: string;
  lead_source: string;
  created_at: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function LeadFlowCard({ leads, newCount }: { leads: LeadRow[]; newCount: number }) {
  const dot = (s: string) =>
    s === "new" ? "#34d399" : s === "contacted" ? HQ_GOLD.text : s === "qualified" ? "#60a5fa" : "#475569";

  return (
    <div
      className="p-5 h-52 flex flex-col"
      style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: HQ_TEXT.muted }}>
          Lead Flow
        </span>
        {newCount > 0 ? (
          <span
            className="font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-1"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
          >
            {newCount} New
          </span>
        ) : (
          <span
            className="font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-1"
            style={{ background: HQ_GOLD.bgTint, border: `1px solid ${HQ_GOLD.border}`, color: HQ_GOLD.dim }}
          >
            {leads.length === 0 ? "No Leads Yet" : "All Reviewed"}
          </span>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="font-sans text-[11px] text-center" style={{ color: HQ_TEXT.helper }}>
            No leads yet — your first submission will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-2.5 overflow-hidden">
            {leads.slice(0, 4).map(lead => (
              <div key={lead.id} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-px" style={{ background: dot(lead.status) }} />
                <span className="font-sans text-[11px] font-medium truncate flex-1" style={{ color: HQ_TEXT.secondary }}>
                  {lead.name}
                </span>
                {lead.lead_source && lead.lead_source !== "direct" && (
                  <span className="font-sans text-[9px] shrink-0 uppercase tracking-wide" style={{ color: HQ_TEXT.helper }}>
                    {lead.lead_source}
                  </span>
                )}
                <span className="font-sans text-[10px] shrink-0" style={{ color: HQ_TEXT.helper }}>
                  {timeAgo(lead.created_at)}
                </span>
              </div>
            ))}
          </div>
          <a
            href="/hq/dashboard/leads"
            className="font-sans text-[10px] mt-3 pt-2 border-t block"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: HQ_TEXT.helper }}
          >
            View all leads →
          </a>
        </>
      )}
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
  const admin = createAdminClient();
  const ga4Ready = ga4IsConfigured();

  const [
    { data: { user } },
    submissions,
    overview,
    { data: recentLeadsData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getSubmissionCounts("7d"),
    ga4Ready ? getGa4Overview("7d") : Promise.resolve(null),
    admin
      .from("contact_submissions")
      .select("id, name, address, status, lead_source, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const recentLeads = (recentLeadsData ?? []) as LeadRow[];
  const newLeadsCount = recentLeads.filter(l => l.status === "new").length;

  const totalSubmissions = submissions.seller + submissions.partner;
  const conversionRate = overview && overview.sessions > 0
    ? `${((totalSubmissions / overview.sessions) * 100).toFixed(1)}%`
    : null;

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
            value={overview ? overview.pageviews.toLocaleString() : "—"}
            sub={overview ? "Page views — last 7 days" : "Connect GA4 to activate"}
            trend={overview && overview.pageviews > 0 ? "up" : "flat"}
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
            value={conversionRate ?? "—"}
            sub={conversionRate ? "Submissions / sessions" : ga4Ready ? "No session data yet" : "Requires GA4 connection"}
            trend={conversionRate ? "up" : "flat"}
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTrafficCard trend={overview?.trend ?? null} />
          <LeadFlowCard leads={recentLeads} newCount={newLeadsCount} />
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
            {recentLeads.length > 0 ? (
              recentLeads.slice(0, 3).map(lead => (
                <ActivityItem
                  key={lead.id}
                  time={timeAgo(lead.created_at)}
                  text={`Seller inquiry from ${lead.name} — ${lead.address.split(",")[0]}`}
                  type="lead"
                />
              ))
            ) : (
              <ActivityItem time="Waiting" text="No lead submissions yet — form submissions will appear here." type="lead" />
            )}
            <ActivityItem time="Active" text="Partner management module is active." type="partner" />
            {!ga4Ready && (
              <ActivityItem time="Pending" text="Analytics module — connect GA4 data API to activate." type="system" />
            )}
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
