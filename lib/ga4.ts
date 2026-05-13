import { OAuth2Client } from "google-auth-library";
import { unstable_cache } from "next/cache";

// ─── Configuration ────────────────────────────────────────────────────────────
// Read process.env inside functions — never at module level.
// Module-level reads are frozen at bundle time; Vercel env vars are only
// available at request time.

function cfg() {
  return {
    propertyId:   process.env.GA4_PROPERTY_ID,
    clientId:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GA4_REFRESH_TOKEN,
  };
}

export function ga4IsConfigured() {
  const { propertyId, clientId, clientSecret, refreshToken } = cfg();
  const configured = !!(propertyId && clientId && clientSecret && refreshToken);
  // Log presence (never values) — visible in Vercel function logs
  console.log("[ga4] env check →",
    "GA4_PROPERTY_ID:", propertyId ? "SET" : "MISSING",
    "| GOOGLE_CLIENT_ID:", clientId ? "SET" : "MISSING",
    "| GOOGLE_CLIENT_SECRET:", clientSecret ? "SET" : "MISSING",
    "| GA4_REFRESH_TOKEN:", refreshToken ? "SET" : "MISSING",
    "| configured:", configured,
  );
  return configured;
}

/** Returns which env vars are present (for diagnostics — no secrets exposed). */
export function ga4EnvStatus() {
  const { propertyId, clientId, clientSecret, refreshToken } = cfg();
  return {
    GA4_PROPERTY_ID:      propertyId   ? `set (${propertyId})` : "MISSING",
    GOOGLE_CLIENT_ID:     clientId     ? `set (${clientId.slice(0, 12)}…)` : "MISSING",
    GOOGLE_CLIENT_SECRET: clientSecret ? "set" : "MISSING",
    GA4_REFRESH_TOKEN:    refreshToken ? `set (${refreshToken.slice(0, 8)}…)` : "MISSING",
    allPresent:           !!(propertyId && clientId && clientSecret && refreshToken),
  };
}

// Returns the OAuth2 auth URL for the one-time setup flow
export function getOAuthSetupUrl(redirectUri: string): string {
  const { clientId, clientSecret } = cfg();
  const client = new OAuth2Client(clientId, clientSecret, redirectUri);
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
  const { clientId, clientSecret } = cfg();
  try {
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await client.getToken(code);
    return { refresh_token: tokens.refresh_token };
  } catch (err) {
    return { refresh_token: null, error: String(err) };
  }
}

// ─── REST transport (replaces BetaAnalyticsDataClient / google-gax) ──────────
// BetaAnalyticsDataClient v5 uses google-gax v4 which calls
// this.auth.getUniverseDomain() — a method that only exists on GoogleAuth,
// not OAuth2Client. Bypassed by calling the GA4 Data API REST endpoint
// directly with the access token from the working OAuth2Client.

interface Ga4RestRow {
  dimensionValues?: Array<{ value: string }>;
  metricValues?: Array<{ value: string }>;
}
interface Ga4RestResponse {
  rows?: Ga4RestRow[];
  error?: { code: number; message: string; status: string };
}

async function getOAuthToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = cfg();
  const auth = new OAuth2Client(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("getAccessToken returned null");
  return token;
}

async function ga4Rest(
  accessToken: string,
  endpoint: "runReport" | "runRealtimeReport",
  body: object
): Promise<Ga4RestResponse> {
  const id = cfg().propertyId?.replace("properties/", "");
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${id}:${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json() as Ga4RestResponse;
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
  return json;
}

/** Tests token refresh + a minimal GA4 REST call. Used by the debug endpoint. */
export async function ga4DiagnosticCheck(): Promise<{
  tokenRefresh: "ok" | "error";
  apiCall: "ok" | "error" | "skipped";
  tokenError?: string;
  apiError?: string;
  rowCount?: number;
}> {
  // Step 1: test OAuth token refresh
  let accessToken: string | null = null;
  try {
    accessToken = await getOAuthToken();
  } catch (err) {
    console.error("[ga4] diagnostic token refresh failed:", err);
    return { tokenRefresh: "error", apiCall: "skipped", tokenError: String(err) };
  }

  // Step 2: minimal GA4 Data API REST call
  try {
    const report = await ga4Rest(accessToken, "runReport", {
      dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
      metrics: [{ name: "sessions" }],
      limit: 1,
    });
    return { tokenRefresh: "ok", apiCall: "ok", rowCount: report.rows?.length ?? 0 };
  } catch (err) {
    console.error("[ga4] diagnostic API call failed:", err);
    return { tokenRefresh: "ok", apiCall: "error", apiError: String(err) };
  }
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
export interface Ga4GeoRow     { region: string; sessions: number }

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
  console.log(`[ga4] fetchOverview(${range}): running live fetch`);
  try {
    const token = await getOAuthToken();
    const dr = toDateRange(range);
    const dim = toDimension(range);

    const [totals, trend] = await Promise.all([
      ga4Rest(token, "runReport", {
        dateRanges: [dr],
        metrics: [
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "activeUsers" },
        ],
      }),
      ga4Rest(token, "runReport", {
        dateRanges: [dr],
        dimensions: [{ name: dim }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: dim } }],
      }),
    ]);

    const row = totals.rows?.[0]?.metricValues ?? [];
    const result = {
      pageviews:   parseInt(row[0]?.value ?? "0"),
      sessions:    parseInt(row[1]?.value ?? "0"),
      activeUsers: parseInt(row[2]?.value ?? "0"),
      trend: (trend.rows ?? []).map((r) => ({
        date:      r.dimensionValues?.[0]?.value ?? "",
        pageviews: parseInt(r.metricValues?.[0]?.value ?? "0"),
        sessions:  parseInt(r.metricValues?.[1]?.value ?? "0"),
      })),
    };
    console.log(`[ga4] fetchOverview(${range}): pageviews=${result.pageviews} sessions=${result.sessions}`);
    return result;
  } catch (err) {
    console.error(`[ga4] fetchOverview(${range}) error:`, err);
    return null;
  }
}

async function fetchSources(range: "today" | "7d" | "30d"): Promise<Ga4SourceRow[] | null> {
  console.log(`[ga4] fetchSources(${range}): running live fetch`);
  try {
    const token = await getOAuthToken();
    const report = await ga4Rest(token, "runReport", {
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 6,
    });
    const rows = (report.rows ?? []).map((r) => ({
      channel:  r.dimensionValues?.[0]?.value ?? "Other",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
    console.log(`[ga4] fetchSources(${range}): ${rows.length} channels`);
    return rows;
  } catch (err) {
    console.error(`[ga4] fetchSources(${range}) error:`, err);
    return null;
  }
}

async function fetchDevices(range: "today" | "7d" | "30d"): Promise<Ga4DeviceRow[] | null> {
  console.log(`[ga4] fetchDevices(${range}): running live fetch`);
  try {
    const token = await getOAuthToken();
    const report = await ga4Rest(token, "runReport", {
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "deviceCategory" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
    });
    const rows = (report.rows ?? []).map((r) => ({
      device:   r.dimensionValues?.[0]?.value ?? "other",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
    console.log(`[ga4] fetchDevices(${range}): ${rows.length} device types`);
    return rows;
  } catch (err) {
    console.error(`[ga4] fetchDevices(${range}) error:`, err);
    return null;
  }
}

async function fetchTopPages(range: "today" | "7d" | "30d"): Promise<Ga4PageRow[] | null> {
  console.log(`[ga4] fetchTopPages(${range}): running live fetch`);
  try {
    const token = await getOAuthToken();
    const report = await ga4Rest(token, "runReport", {
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics:    [{ name: "screenPageViews" }],
      orderBys:   [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    });
    const rows = (report.rows ?? []).map((r) => ({
      path:      r.dimensionValues?.[0]?.value ?? "/",
      title:     r.dimensionValues?.[1]?.value ?? "Untitled",
      pageviews: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
    console.log(`[ga4] fetchTopPages(${range}): ${rows.length} pages`);
    return rows;
  } catch (err) {
    console.error(`[ga4] fetchTopPages(${range}) error:`, err);
    return null;
  }
}

async function fetchGeo(range: "today" | "7d" | "30d"): Promise<Ga4GeoRow[] | null> {
  console.log(`[ga4] fetchGeo(${range}): running live fetch`);
  try {
    const token = await getOAuthToken();
    const report = await ga4Rest(token, "runReport", {
      dateRanges: [toDateRange(range)],
      dimensions: [{ name: "region" }],
      metrics:    [{ name: "sessions" }],
      orderBys:   [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    });
    const rows = (report.rows ?? []).map(r => ({
      region:   r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
    }));
    console.log(`[ga4] fetchGeo(${range}): ${rows.length} regions`);
    return rows;
  } catch (err) {
    console.error(`[ga4] fetchGeo(${range}) error:`, err);
    return null;
  }
}

async function fetchRealtime(): Promise<number> {
  console.log("[ga4] fetchRealtime: running live fetch");
  try {
    const token = await getOAuthToken();
    const report = await ga4Rest(token, "runRealtimeReport", {
      metrics: [{ name: "activeUsers" }],
    });
    const count = parseInt(report.rows?.[0]?.metricValues?.[0]?.value ?? "0");
    console.log(`[ga4] fetchRealtime: ${count} active users`);
    return count;
  } catch (err) {
    console.error("[ga4] fetchRealtime error:", err);
    return 0;
  }
}

// ─── Cached exports ───────────────────────────────────────────────────────────

export const getGa4Overview = unstable_cache(
  fetchOverview,
  ["ga4", "overview"],
  { revalidate: 300 }
);

export const getGa4Sources = unstable_cache(
  fetchSources,
  ["ga4", "sources"],
  { revalidate: 300 }
);

export const getGa4Devices = unstable_cache(
  fetchDevices,
  ["ga4", "devices"],
  { revalidate: 300 }
);

export const getGa4TopPages = unstable_cache(
  fetchTopPages,
  ["ga4", "pages"],
  { revalidate: 300 }
);

export const getGa4Geo = unstable_cache(
  fetchGeo,
  ["ga4", "geo"],
  { revalidate: 300 }
);

// Realtime is not cached — always fresh
export { fetchRealtime as getGa4Realtime };
