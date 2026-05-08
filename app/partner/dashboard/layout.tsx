import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Portal — Island Investors",
  robots: { index: false, follow: false },
};

export default async function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/hq");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string } | null; error: unknown };

  if (!profile || profile.status !== "active" || profile.role !== "partner") {
    redirect("/hq");
  }

  return (
    // Fixed overlay hides the public site header/footer
    <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ background: "#060E1A" }}>
      {children}
    </div>
  );
}
