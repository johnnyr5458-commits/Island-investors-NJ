"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { UserStatus } from "@/lib/supabase/types";

// Verify the caller is an active admin before any mutation
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string } | null; error: unknown };

  if (!profile || profile.status !== "active" || profile.role !== "admin") {
    throw new Error("Admin access required");
  }
  return supabase;
}

export async function invitePartner(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const company = formData.get("company") as string;
  const buying_areas = formData.get("buying_areas") as string;
  const budget = formData.get("budget") as string;
  const property_types = formData.get("property_types") as string;
  const notes = formData.get("notes") as string;

  // Invite the user — Supabase sends them an email with a magic link
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/hq`,
  });

  if (error) throw new Error(error.message);

  // Upsert profile with partner role
  await admin.from("profiles").upsert({
    id: data.user.id,
    email,
    name,
    phone,
    company,
    buying_areas,
    budget,
    property_types,
    notes,
    role: "partner",
    status: "pending",
  });

  revalidatePath("/hq/dashboard/partners");
}

export async function updatePartnerStatus(partnerId: string, status: UserStatus) {
  const supabase = await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("profiles") as any).update({ status }).eq("id", partnerId);

  revalidatePath("/hq/dashboard/partners");
}

export async function updatePartnerProfile(partnerId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const updates = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    company: formData.get("company") as string,
    buying_areas: formData.get("buying_areas") as string,
    budget: formData.get("budget") as string,
    property_types: formData.get("property_types") as string,
    notes: formData.get("notes") as string,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("profiles") as any).update(updates).eq("id", partnerId);

  revalidatePath("/hq/dashboard/partners");
}
