"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/supabase/types";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active" || !["admin", "team"].includes(profile.role)) {
    throw new Error("Admin access required");
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("contact_submissions").update({ status }).eq("id", leadId);
  revalidatePath("/hq/dashboard/leads");
}
