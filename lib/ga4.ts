import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { OAuth2Client } from "google-auth-library";
import { unstable_cache } from "next/cache";

// ─── Configuration ────────────────────────────────────────────────────────────

const PROPERTY_ID  = process.env.GA4_PROPERTY_ID;
const CLIENT_ID    = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GA4_REFRESH_TOKEN;

export function ga4IsConfigured() {
  return !!(PROPERTY_ID && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
}

// Returns the OAuth2 auth URL for the one-time setup flow
export function getOAuthSetupUrl(redirectUri: string): string {
  const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
}

// Exchanges an authorization code for tokens (returns the refresh_token)
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ refresh_token: string | null | undefined; error?: string }> {
  try {
    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);
    const { tokens } = await client.getToken(code);
    return { refresh_token: tokens.refresh_token };
  } catch (err) {
    return { refresh_token: null, error: String(err) };
  }
}

function createDataClient(): BetaAnalyticsDataClient {
  const auth = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);
  auth.setCredentials({ refresh_token: REFRESH_TOKEN });
  // OAuth2Client satisfies the auth interface at runtime; cast resolves gax version type mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new BetaAnalyticsDataClient({ auth: auth as any });
}

function propertyName() {
  const id = PROPERTY_ID?.replace("properties/", "");
  return `properties/${id}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Ga4Overview {
  pageviews: number;
  sessions: number;
  activeUsers: number;
  trend: Array<{ date: string; pageviews: number; sessions: number }>;
}

export interface Ga4SourceRow { channel: string; sessions: number }
export interface Ga4DeviceRow  { device: string;  sessions: number }
export interface Ga4PageRow    { path: string; title: string; pageviews: number }

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toDateRange(range: "today" | "7d" | "30d") {
  return range === "today"
    ? { startDate: "today",      endDate: "today"     }
    : range === "7d"
    ? { startDate: "7daysAgo",   endDate: "yesterday" }
    : { startDate: "30daysAgo",  endDate: "yesterday" };
}

function toDimension(range: "today" | "7d" | "30d") {
  return range === "today" ? "hour" : "date";
}

// ─── Fetchers (uncached — wrapped below) ──────────────────────────────────────

async function fetchOverview(range: "today" | "7d" | "30d"): Promise<Ga4Overview | null> {
  if (!ga4IsConfigured()) return null;
  try {
    const client = createDataClient();
    const dr = toDateRange(range);
    const dim = toDimension(range);

    const [totals, trend] = await Promise.all([
      client.runReport({
        property: propertyName(),
        dateRanges: [dr],
        metrics: [
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "activeUsers" },
        ],
      }),
      client.runReport({
        property: propertyName(),
        dateRanges: [dr],
        dimensions: [{ name: dim }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: dim } }],
      }),
    ]);

    const row = totals[0]?.rows?.[0]?.metricValues ?? [];
    return {
      pageviews:   parseInt(row[0]?.value ?? "0"),
      sessions:    parseInt(row[1]?.value ?? "0"),
      activeUsers: parseInt(row[2]?.value ?? "0"),
      trend: (trend[0]?.rows ?? []).map((r) => ({
        date:      r.dimensionValues?.[0]?.value ?? "",
        pageviews: parseInt(r.metricValues?.[0]?.value ?? "0"),
        sessions:  parseInt(r.metricValues?.[1]?.value ?? "0"),
      })),
    };
  } catch {
    return null;
  }
}

async function fetchSources(range: "today" | "7d" | "30d"): Promise<Ga4SourceRow[] | null> {
  if (!ga4IsConfigured()) return null;
  try {
    const client = createDataClient();
    const [report] = await client.runReport({
      property: propertyName(),
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    });
    return (report.rows ?? []).map((r) => ({
      channel:  r.dimensionValues?.[0]?.value ?? "Other",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
  } catch {
    return null;
  }
}

async function fetchDevices(range: "today" | "7d" | "30d"): Promise<Ga4DeviceRow[] | null> {
  if (!ga4IsConfigured()) return null;
  try {
    const client = createDataClient();
    const [report] = await client.runReport({
      property: propertyName(),
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "deviceCategory" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
    });
    return (report.rows ?? []).map((r) => ({
      device:   r.dimensionValues?.[0]?.value ?? "other",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
  } catch {
    return null;
  }
}

async function fetchTopPages(range: "today" | "7d" | "30d"): Promise<Ga4PageRow[] | null> {
  if (!ga4IsConfigured()) return null;
  try {
    const client = createDataClient();
    const [report] = await client.runReport({
      property: propertyName(),
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics:    [{ name: "screenPageViews" }],
      orderBys:   [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    });
    return (report.rows ?? []).map((r) => ({
      path:      r.dimensionValues?.[0]?.value ?? "/",
      title:     r.dimensionValues?.[1]?.value ?? "Untitled",
      pageviews: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
  } catch {
    return null;
  }
}

async function fetchRealtime(): Promise<number> {
  if (!ga4IsConfigured()) return 0;
  try {
    const client = createDataClient();
    const [report] = await client.runRealtimeReport({
      property: propertyName(),
      metrics: [{ name: "activeUsers" }],
    });
    return parseInt(report.rows?.[0]?.metricValues?.[0]?.value ?? "0");
  } catch {
    return 0;
  }
}

// ─── Cached exports ───────────────────────────────────────────────────────────

export const getGa4Overview = unstable_cache(
  fetchOverview,
  ["ga4", "overview"],
  { revalidate: 900 }
);

export const getGa4Sources = unstable_cache(
  fetchSources,
  ["ga4", "sources"],
  { revalidate: 900 }
);

export const getGa4Devices = unstable_cache(
  fetchDevices,
  ["ga4", "devices"],
  { revalidate: 900 }
);

export const getGa4TopPages = unstable_cache(
  fetchTopPages,
  ["ga4", "pages"],
  { revalidate: 900 }
);

// Realtime is not cached — always fresh
export { fetchRealtime as getGa4Realtime };
