import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import PartnersClient from "./PartnersClient";
import type { Profile } from "@/lib/supabase/types";

export default async function PartnersPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "partner")
    .order("created_at", { ascending: false });

  return (
    <>
      <TopBar title="Partners" subtitle="Investor network management" />
      <main className="flex-1 p-6">
        <PartnersClient partners={(partners ?? []) as Profile[]} />
      </main>
    </>
  );
}
