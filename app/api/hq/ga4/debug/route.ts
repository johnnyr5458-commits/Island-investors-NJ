import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ga4EnvStatus, ga4DiagnosticCheck } from "@/lib/ga4";

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

// Admin-only endpoint — returns a full diagnostic report for GA4 integration.
// Hit this in a browser or via curl while logged into HQ to see exactly
// where the pipeline breaks: env vars → token refresh → Data API call.
export async function GET() {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const envStatus = ga4EnvStatus();

  if (!envStatus.allPresent) {
    return NextResponse.json({
      step: "env_check",
      status: "fail",
      env: envStatus,
      fix: "Add missing env vars to Vercel → Project → Settings → Environment Variables, then redeploy.",
    });
  }

  const diagnostic = await ga4DiagnosticCheck();

  return NextResponse.json({
    step: "complete",
    env: envStatus,
    ...diagnostic,
    hints: diagnostic.apiError ? [
      "If error mentions 'property not found': GA4_PROPERTY_ID must be the numeric property ID (e.g. 536767193), NOT the Measurement ID (G-XXXXXX). Find it in GA4 Admin → Property Settings → Property ID.",
      "If error mentions 'Google Analytics Data API has not been used' or 'disabled': Enable it at console.cloud.google.com → APIs & Services → Enable APIs → search 'Google Analytics Data API'.",
      "If error mentions 'PERMISSION_DENIED': The Google account that authorized the OAuth token must have at least Viewer access to the GA4 property.",
      "If error mentions 'invalid_grant' or 'Token has been expired': The refresh token is stale. Visit /api/hq/ga4/setup to re-authorize and get a new refresh token.",
    ] : [],
  });
}
