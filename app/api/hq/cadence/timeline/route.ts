import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { CadenceEvent } from "@/lib/supabase/types";

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

export async function GET(req: NextRequest) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("cadence_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("[cadence/timeline] query error:", error.message);
    return NextResponse.json({ events: [] });
  }

  return NextResponse.json({ events: (data ?? []) as CadenceEvent[] });
}
