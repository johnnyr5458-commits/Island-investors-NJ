import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";

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

  const submissions = await getSubmissionCounts(safeRange);

  return NextResponse.json({
    range: safeRange,
    ga4Configured: false,
    submissions: {
      seller: submissions.seller,
      partner: submissions.partner,
      conversionRate: null,
    },
  });
}
