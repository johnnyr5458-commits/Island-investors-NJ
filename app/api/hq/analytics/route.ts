import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";
import {
  ga4IsConfigured,
  ga4EnvStatus,
  getGa4Overview,
  getGa4Sources,
  getGa4Devices,
  getGa4TopPages,
  getGa4Realtime,
} from "@/lib/ga4";

type Range = "today" | "7d" | "30d";

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

export async function GET(request: NextRequest) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const range = (searchParams.get("range") ?? "7d") as Range;
  const validRanges: Range[] = ["today", "7d", "30d"];
  const safeRange = validRanges.includes(range) ? range : "7d";
  const metric = searchParams.get("metric");

  // Realtime sub-request — short-circuit
  if (metric === "realtime") {
    const activeUsers = await getGa4Realtime();
    return NextResponse.json({ activeUsers });
  }

  const envStatus = ga4EnvStatus();
  const configured = envStatus.allPresent;
  console.log("[analytics] ga4 env status:", envStatus);
  console.log("[analytics] ga4IsConfigured:", configured, "range:", safeRange);

  const [submissions, overview, sources, devices, topPages] = await Promise.all([
    getSubmissionCounts(safeRange),
    configured ? getGa4Overview(safeRange) : Promise.resolve(null),
    configured ? getGa4Sources(safeRange)  : Promise.resolve(null),
    configured ? getGa4Devices(safeRange)  : Promise.resolve(null),
    configured ? getGa4TopPages(safeRange) : Promise.resolve(null),
  ]);

  console.log("[analytics] results:", {
    overview:  overview  ? `ok (sessions=${overview.sessions})` : "null",
    sources:   sources   ? `ok (${sources.length} rows)` : "null",
    devices:   devices   ? `ok (${devices.length} rows)` : "null",
    topPages:  topPages  ? `ok (${topPages.length} rows)` : "null",
    seller:    submissions.seller,
    partner:   submissions.partner,
  });

  // Conversion rate = total form submissions / sessions * 100
  const sessions = overview?.sessions ?? 0;
  const totalSubmissions = submissions.seller + submissions.partner;
  const conversionRate = sessions > 0
    ? `${((totalSubmissions / sessions) * 100).toFixed(2)}%`
    : null;

  return NextResponse.json({
    range: safeRange,
    ga4Configured: configured,
    overview,
    sources,
    devices,
    topPages,
    submissions: {
      seller: submissions.seller,
      partner: submissions.partner,
      conversionRate,
    },
  });
}
