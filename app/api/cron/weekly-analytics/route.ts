import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { createClient } from "@supabase/supabase-js";

// ─── Auth ─────────────────────────────────────────────────────────────────────

function authorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  // Accept ANALYTICS_CRON_SECRET (local/manual) or CRON_SECRET (Vercel's built-in cron var)
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  return !!secret && token === secret;
}

// ─── GA4 types ────────────────────────────────────────────────────────────────

interface Ga4Row {
  dimensionValues?: Array<{ value: string }>;
  metricValues?: Array<{ value: string }>;
}
interface Ga4Response {
  rows?: Ga4Row[];
  error?: { message: string };
}

// ─── GA4 helpers ──────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const auth = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GA4_REFRESH_TOKEN });
  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("GA4 getAccessToken returned null");
  return token;
}

async function ga4Run(token: string, body: object): Promise<Ga4Response> {
  const id = (process.env.GA4_PROPERTY_ID ?? "").replace("properties/", "");
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json() as Ga4Response;
  if (!res.ok) throw new Error(json?.error?.message ?? `GA4 HTTP ${res.status}`);
  return json;
}

function int(v: string | undefined) { return parseInt(v ?? "0", 10); }
function flt(v: string | undefined) { return parseFloat(v ?? "0"); }

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

const THIS_WEEK = { startDate: "7daysAgo",  endDate: "yesterday" };
const PREV_WEEK = { startDate: "14daysAgo", endDate: "8daysAgo"  };

// ─── Markdown generation ──────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function fmtDateLabel(iso: string): string {
  // GA4 returns dates as "20260510" — normalise to YYYY-MM-DD first
  const d = iso.length === 8
    ? `${iso.slice(0, 4)}-${iso.slice(4, 6)}-${iso.slice(6, 8)}`
    : iso;
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function chg(cur: number, prev: number): string {
  if (prev === 0) return cur > 0 ? "+∞" : "—";
  const p = ((cur - prev) / prev) * 100;
  return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
}

function notable(cur: number, prev: number, label: string, threshold = 20): string | null {
  if (prev === 0) return null;
  const p = ((cur - prev) / prev) * 100;
  if (Math.abs(p) < threshold) return null;
  return `${label} ${p > 0 ? "up" : "down"} ${Math.abs(p).toFixed(1)}% week-over-week (${prev.toLocaleString()} → ${cur.toLocaleString()})`;
}

interface ReportData {
  period: { current: { start: string; end: string }; previous: { start: string; end: string } };
  ga4Configured: boolean;
  overview: { this: { pageviews: number; sessions: number; activeUsers: number }; prev: { pageviews: number; sessions: number; activeUsers: number } } | null;
  sources: Array<{ channel: string; sessions: number; prevSessions: number }> | null;
  devices: Array<{ device: string; sessions: number }> | null;
  topPages: Array<{ path: string; title: string; pageviews: number }> | null;
  newVsReturning: Array<{ type: string; sessions: number }> | null;
  engagement: { avgSessionDuration: number; engagementRate: number; bounceRate: number; engagedSessions: number } | null;
  blogPages: Array<{ path: string; title: string; pageviews: number; avgDuration: number }> | null;
  referralSources: Array<{ source: string; medium: string; sessions: number }> | null;
  dailyTrend: Array<{ date: string; pageviews: number; sessions: number }> | null;
  submissions: {
    this: { seller: number; partner: number };
    prev: { seller: number; partner: number };
  };
}

function generateMarkdown(data: ReportData, reportDate: string): string {
  const { overview, sources, devices, topPages, newVsReturning, engagement,
    blogPages, referralSources, dailyTrend, submissions, period, ga4Configured } = data;

  const periodLabel = `${fmtDateLabel(period.current.start)} – ${fmtDateLabel(period.current.end)}`;
  const generatedAt = new Date().toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });

  const lines: string[] = [];

  // Header
  lines.push(`# Weekly Analytics Report — ${reportDate}`, "");
  lines.push(`**Period:** ${periodLabel}  `);
  lines.push(`**Generated:** ${generatedAt}  `);
  lines.push(`**Property:** islandinvestorsnj.com`);
  if (!ga4Configured) {
    lines.push("", "> ⚠ **GA4 not configured** — only Supabase form data is available.");
  }
  lines.push("", "---", "");

  // ── Weekly Summary ─────────────────────────────────────────────────────────
  if (overview) {
    lines.push("## Weekly Summary", "");
    lines.push("| Metric | This Week | Last Week | Change |");
    lines.push("|---|---:|---:|---:|");
    lines.push(`| Sessions | ${overview.this.sessions.toLocaleString()} | ${overview.prev.sessions.toLocaleString()} | ${chg(overview.this.sessions, overview.prev.sessions)} |`);
    lines.push(`| Pageviews | ${overview.this.pageviews.toLocaleString()} | ${overview.prev.pageviews.toLocaleString()} | ${chg(overview.this.pageviews, overview.prev.pageviews)} |`);
    lines.push(`| Active Users | ${overview.this.activeUsers.toLocaleString()} | ${overview.prev.activeUsers.toLocaleString()} | ${chg(overview.this.activeUsers, overview.prev.activeUsers)} |`);
    if (engagement) {
      lines.push(`| Avg. Session Duration | ${fmtDuration(engagement.avgSessionDuration)} | — | — |`);
      lines.push(`| Engagement Rate | ${(engagement.engagementRate * 100).toFixed(1)}% | — | — |`);
      lines.push(`| Bounce Rate | ${(engagement.bounceRate * 100).toFixed(1)}% | — | — |`);
    }
    lines.push("", "---", "");
  }

  // ── Top Pages ─────────────────────────────────────────────────────────────
  if (topPages?.length) {
    lines.push("## Top Pages", "");
    lines.push("| # | Path | Title | Views |");
    lines.push("|---|---|---|---:|");
    topPages.forEach((p, i) => {
      const title = p.title.length > 48 ? p.title.slice(0, 45) + "…" : p.title;
      lines.push(`| ${i + 1} | \`${p.path}\` | ${title} | ${p.pageviews.toLocaleString()} |`);
    });
    lines.push("", "---", "");
  }

  // ── Traffic Sources ───────────────────────────────────────────────────────
  if (sources?.length) {
    const total = sources.reduce((s, r) => s + r.sessions, 0);
    lines.push("## Traffic Sources", "");
    lines.push("| Channel | Sessions | % of Total | Last Week | Change |");
    lines.push("|---|---:|---:|---:|---:|");
    sources.forEach(s => {
      const pct = total > 0 ? ((s.sessions / total) * 100).toFixed(1) : "0.0";
      lines.push(`| ${s.channel} | ${s.sessions.toLocaleString()} | ${pct}% | ${s.prevSessions.toLocaleString()} | ${chg(s.sessions, s.prevSessions)} |`);
    });
    lines.push("", "---", "");
  }

  // ── Visitor Behavior ──────────────────────────────────────────────────────
  lines.push("## Visitor Behavior", "");

  if (newVsReturning?.length) {
    const total = newVsReturning.reduce((s, r) => s + r.sessions, 0);
    lines.push("**New vs. Returning:**");
    newVsReturning.forEach(r => {
      const pct = total > 0 ? ((r.sessions / total) * 100).toFixed(1) : "0.0";
      const label = r.type === "new" ? "New visitors" : "Returning visitors";
      lines.push(`- ${label}: ${r.sessions.toLocaleString()} sessions (${pct}%)`);
    });
    lines.push("");
  }

  if (devices?.length) {
    const total = devices.reduce((s, d) => s + d.sessions, 0);
    lines.push("**Device Breakdown:**");
    devices.forEach(d => {
      const pct = total > 0 ? ((d.sessions / total) * 100).toFixed(1) : "0.0";
      lines.push(`- ${d.device.charAt(0).toUpperCase() + d.device.slice(1)}: ${d.sessions.toLocaleString()} sessions (${pct}%)`);
    });
    lines.push("");
  }

  if (engagement) {
    lines.push("**Session Behavior:**");
    lines.push(`- Average session duration: ${fmtDuration(engagement.avgSessionDuration)}`);
    lines.push(`- Engaged sessions: ${engagement.engagedSessions.toLocaleString()}`);
    lines.push(`- Engagement rate: ${(engagement.engagementRate * 100).toFixed(1)}%`);
    lines.push(`- Bounce rate: ${(engagement.bounceRate * 100).toFixed(1)}%`);
    lines.push("");
  }

  lines.push("---", "");

  // ── Blog & Content Performance ─────────────────────────────────────────────
  lines.push("## Blog & Content Performance", "");
  if (blogPages?.length) {
    lines.push("| Post | Views | Avg. Time on Page |");
    lines.push("|---|---:|---:|");
    blogPages.forEach(p => {
      const title = p.title.length > 60 ? p.title.slice(0, 57) + "…" : p.title;
      lines.push(`| ${title} | ${p.pageviews.toLocaleString()} | ${fmtDuration(p.avgDuration)} |`);
    });
  } else {
    lines.push(ga4Configured
      ? "No blog posts received traffic this week."
      : "GA4 not configured — blog data unavailable.");
  }
  lines.push("", "---", "");

  // ── Referral Sources ──────────────────────────────────────────────────────
  if (referralSources?.length) {
    const interesting = referralSources.filter(
      r => !(r.source === "(direct)" && r.medium === "(none)") && r.sessions >= 1,
    );
    if (interesting.length) {
      lines.push("## Referral Sources", "");
      lines.push("| Source | Medium | Sessions |");
      lines.push("|---|---|---:|");
      interesting.forEach(r =>
        lines.push(`| ${r.source} | ${r.medium} | ${r.sessions.toLocaleString()} |`),
      );
      lines.push("", "---", "");
    }
  }

  // ── Form & Conversion Activity ─────────────────────────────────────────────
  const totalThis = submissions.this.seller + submissions.this.partner;
  const totalPrev = submissions.prev.seller + submissions.prev.partner;
  const sessions = overview?.this?.sessions ?? 0;
  const convRate = sessions > 0 ? `${((totalThis / sessions) * 100).toFixed(2)}%` : "—";

  lines.push("## Form & Conversion Activity", "");
  lines.push("| Type | This Week | Last Week | Change |");
  lines.push("|---|---:|---:|---:|");
  lines.push(`| Seller inquiries | ${submissions.this.seller} | ${submissions.prev.seller} | ${chg(submissions.this.seller, submissions.prev.seller)} |`);
  lines.push(`| Partner submissions | ${submissions.this.partner} | ${submissions.prev.partner} | ${chg(submissions.this.partner, submissions.prev.partner)} |`);
  lines.push(`| **Total forms** | **${totalThis}** | **${totalPrev}** | **${chg(totalThis, totalPrev)}** |`);
  lines.push(`| Conversion rate | ${convRate} | — | — |`);
  lines.push("", "---", "");

  // ── Daily Traffic Trend ────────────────────────────────────────────────────
  if (dailyTrend?.length) {
    lines.push("## Daily Traffic Trend", "");
    lines.push("| Date | Pageviews | Sessions |");
    lines.push("|---|---:|---:|");
    dailyTrend.forEach(d =>
      lines.push(`| ${fmtDateLabel(d.date)} | ${d.pageviews.toLocaleString()} | ${d.sessions.toLocaleString()} |`),
    );
    lines.push("", "---", "");
  }

  // ── Notable Changes ────────────────────────────────────────────────────────
  const notes: string[] = [];

  if (overview) {
    const n1 = notable(overview.this.sessions, overview.prev.sessions, "Sessions");
    const n2 = notable(overview.this.pageviews, overview.prev.pageviews, "Pageviews");
    if (n1) notes.push(n1);
    if (n2) notes.push(n2);
  }

  if (sources) {
    sources.forEach(s => {
      if (s.prevSessions > 0 && s.sessions >= 5) {
        const n = notable(s.sessions, s.prevSessions, `${s.channel} traffic`, 40);
        if (n) notes.push(n);
      }
    });
  }

  if (topPages?.length) {
    notes.push(`Top page: \`${topPages[0].path}\` — ${topPages[0].pageviews.toLocaleString()} views`);
  }

  if (blogPages?.length) {
    notes.push(`Top blog post: "${blogPages[0].title}" — ${blogPages[0].pageviews.toLocaleString()} views`);
  }

  notes.push(
    totalThis > 0
      ? `${totalThis} form submission${totalThis !== 1 ? "s" : ""} this week (${submissions.this.seller} seller, ${submissions.this.partner} partner)`
      : "No form submissions this week",
  );

  if (notes.length) {
    lines.push("## Notable Changes", "");
    notes.forEach(n => lines.push(`- ${n}`));
    lines.push("", "---", "");
  }

  lines.push("*Collected automatically — GA4 Data API + Supabase*", "");

  return lines.join("\n");
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured", hint: "ANALYTICS_CRON_SECRET and CRON_SECRET are both unset in Vercel env" }, { status: 503 });
  }
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reportDate = isoDate(0); // today (Sunday when cron fires)

  // ── Supabase ──────────────────────────────────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const prevWeekStart = new Date();
  prevWeekStart.setDate(prevWeekStart.getDate() - 14);
  const prevWeekEnd = new Date();
  prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

  const [sellerThis, partnerThis, sellerPrev, partnerPrev] = await Promise.all([
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).gte("created_at", thisWeekStart.toISOString()),
    supabase.from("partner_submissions").select("id", { count: "exact", head: true }).gte("created_at", thisWeekStart.toISOString()),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).gte("created_at", prevWeekStart.toISOString()).lt("created_at", prevWeekEnd.toISOString()),
    supabase.from("partner_submissions").select("id", { count: "exact", head: true }).gte("created_at", prevWeekStart.toISOString()).lt("created_at", prevWeekEnd.toISOString()),
  ]);

  const submissions = {
    this: { seller: sellerThis.count ?? 0, partner: partnerThis.count ?? 0 },
    prev: { seller: sellerPrev.count ?? 0, partner: partnerPrev.count ?? 0 },
  };

  const ga4Configured = !!(
    process.env.GA4_PROPERTY_ID &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GA4_REFRESH_TOKEN
  );

  const baseData: ReportData = {
    period: {
      current:  { start: isoDate(7), end: isoDate(1) },
      previous: { start: isoDate(14), end: isoDate(8) },
    },
    ga4Configured,
    overview: null,
    sources: null,
    devices: null,
    topPages: null,
    newVsReturning: null,
    engagement: null,
    blogPages: null,
    referralSources: null,
    dailyTrend: null,
    submissions,
  };

  // ── GA4 queries ───────────────────────────────────────────────────────────
  if (ga4Configured) {
    let token: string;
    try {
      token = await getToken();
    } catch (err) {
      console.error("[weekly-analytics] GA4 token failed:", err);
      // Still save with Supabase-only data
      const markdown = generateMarkdown(baseData, reportDate);
      await supabase.from("analytics_weekly_reports").upsert({ report_date: reportDate, report_markdown: markdown, data_json: baseData }, { onConflict: "report_date" });
      return NextResponse.json({ ok: true, reportDate, ga4Configured: false, error: "GA4 token failed" });
    }

    const results = await Promise.allSettled([
      ga4Run(token, { dateRanges: [THIS_WEEK], metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "activeUsers" }] }),
      ga4Run(token, { dateRanges: [PREV_WEEK], metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "activeUsers" }] }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 }),
      ga4Run(token, { dateRanges: [PREV_WEEK], dimensions: [{ name: "sessionDefaultChannelGroup" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 8 }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }] }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "pagePath" }, { name: "pageTitle" }], metrics: [{ name: "screenPageViews" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 12 }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "newVsReturning" }], metrics: [{ name: "sessions" }] }),
      ga4Run(token, { dateRanges: [THIS_WEEK], metrics: [{ name: "averageSessionDuration" }, { name: "engagementRate" }, { name: "bounceRate" }, { name: "engagedSessions" }] }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "pagePath" }, { name: "pageTitle" }], metrics: [{ name: "screenPageViews" }, { name: "averageSessionDuration" }], dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/blog/" } } }, orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 10 }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }], metrics: [{ name: "sessions" }], orderBys: [{ metric: { metricName: "sessions" }, desc: true }], limit: 10 }),
      ga4Run(token, { dateRanges: [THIS_WEEK], dimensions: [{ name: "date" }], metrics: [{ name: "screenPageViews" }, { name: "sessions" }], orderBys: [{ dimension: { dimensionName: "date" } }] }),
    ]);

    function ok<T>(r: PromiseSettledResult<T>): T | null {
      return r.status === "fulfilled" ? r.value : null;
    }

    const [ovThis, ovPrev, srcThis, srcPrev, devR, pagesR, nvrR, engR, blogR, refR, trendR] = results;

    // Overview
    const ovThisRow = ok(ovThis)?.rows?.[0]?.metricValues ?? [];
    const ovPrevRow = ok(ovPrev)?.rows?.[0]?.metricValues ?? [];
    baseData.overview = {
      this: { pageviews: int(ovThisRow[0]?.value), sessions: int(ovThisRow[1]?.value), activeUsers: int(ovThisRow[2]?.value) },
      prev: { pageviews: int(ovPrevRow[0]?.value), sessions: int(ovPrevRow[1]?.value), activeUsers: int(ovPrevRow[2]?.value) },
    };

    // Sources with prev week map
    const prevMap: Record<string, number> = {};
    (ok(srcPrev)?.rows ?? []).forEach(r => {
      prevMap[r.dimensionValues?.[0]?.value ?? ""] = int(r.metricValues?.[0]?.value);
    });
    baseData.sources = (ok(srcThis)?.rows ?? []).map(r => ({
      channel: r.dimensionValues?.[0]?.value ?? "Other",
      sessions: int(r.metricValues?.[0]?.value),
      prevSessions: prevMap[r.dimensionValues?.[0]?.value ?? ""] ?? 0,
    }));

    // Devices
    baseData.devices = (ok(devR)?.rows ?? []).map(r => ({
      device: r.dimensionValues?.[0]?.value ?? "other",
      sessions: int(r.metricValues?.[0]?.value),
    }));

    // Top pages
    baseData.topPages = (ok(pagesR)?.rows ?? []).map(r => ({
      path: r.dimensionValues?.[0]?.value ?? "/",
      title: r.dimensionValues?.[1]?.value ?? "Untitled",
      pageviews: int(r.metricValues?.[0]?.value),
    }));

    // New vs returning
    baseData.newVsReturning = (ok(nvrR)?.rows ?? []).map(r => ({
      type: r.dimensionValues?.[0]?.value ?? "unknown",
      sessions: int(r.metricValues?.[0]?.value),
    }));

    // Engagement
    const engRow = ok(engR)?.rows?.[0]?.metricValues ?? [];
    baseData.engagement = {
      avgSessionDuration: flt(engRow[0]?.value),
      engagementRate: flt(engRow[1]?.value),
      bounceRate: flt(engRow[2]?.value),
      engagedSessions: int(engRow[3]?.value),
    };

    // Blog pages
    baseData.blogPages = (ok(blogR)?.rows ?? []).map(r => ({
      path: r.dimensionValues?.[0]?.value ?? "/",
      title: r.dimensionValues?.[1]?.value ?? "Untitled",
      pageviews: int(r.metricValues?.[0]?.value),
      avgDuration: flt(r.metricValues?.[1]?.value),
    }));

    // Referral sources
    baseData.referralSources = (ok(refR)?.rows ?? []).map(r => ({
      source: r.dimensionValues?.[0]?.value ?? "(direct)",
      medium: r.dimensionValues?.[1]?.value ?? "(none)",
      sessions: int(r.metricValues?.[0]?.value),
    }));

    // Daily trend
    baseData.dailyTrend = (ok(trendR)?.rows ?? []).map(r => ({
      date: r.dimensionValues?.[0]?.value ?? "",
      pageviews: int(r.metricValues?.[0]?.value),
      sessions: int(r.metricValues?.[1]?.value),
    }));
  }

  // ── Generate and persist ──────────────────────────────────────────────────
  const markdown = generateMarkdown(baseData, reportDate);

  const { error } = await supabase
    .from("analytics_weekly_reports")
    .upsert(
      { report_date: reportDate, report_markdown: markdown, data_json: baseData },
      { onConflict: "report_date" },
    );

  if (error) {
    console.error("[weekly-analytics] Supabase upsert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[weekly-analytics] Report saved for ${reportDate} — sessions: ${baseData.overview?.this.sessions ?? "N/A"}`);

  return NextResponse.json({
    ok: true,
    reportDate,
    ga4Configured,
    sessions: baseData.overview?.this.sessions ?? null,
    forms: submissions.this.seller + submissions.this.partner,
  });
}
