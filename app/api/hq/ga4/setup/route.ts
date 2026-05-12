import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOAuthSetupUrl } from "@/lib/ga4";

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

export async function GET() {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Debug: log which env vars are present at request time (values redacted)
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const propertyId   = process.env.GA4_PROPERTY_ID;
  console.log("[ga4/setup] env check:", {
    GOOGLE_CLIENT_ID:     clientId     ? `set (${clientId.slice(0, 8)}…)` : "MISSING",
    GOOGLE_CLIENT_SECRET: clientSecret ? "set" : "MISSING",
    GA4_PROPERTY_ID:      propertyId   ? `set (${propertyId})` : "MISSING",
  });

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: "OAuth credentials not configured",
        missing: [
          !clientId     && "GOOGLE_CLIENT_ID",
          !clientSecret && "GOOGLE_CLIENT_SECRET",
        ].filter(Boolean),
        hint: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Vercel Environment Variables, then redeploy.",
      },
      { status: 500 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/hq/ga4/callback`;
  const authUrl = getOAuthSetupUrl(redirectUri);

  console.log("[ga4/setup] redirecting to Google OAuth, redirect_uri:", redirectUri);
  return NextResponse.redirect(authUrl);
}
