import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/hq/Sidebar";
import type { Profile } from "@/lib/supabase/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/hq");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Profile | null; error: unknown };

  if (!profile || profile.status !== "active" || !["admin", "team"].includes(profile.role)) {
    redirect("/hq");
  }

  return (
    <div className="flex h-full">
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
