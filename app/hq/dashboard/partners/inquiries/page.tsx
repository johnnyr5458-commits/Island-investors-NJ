import { createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/hq/TopBar";
import StatCard from "@/components/hq/StatCard";
import PartnerInquiriesClient from "@/components/hq/partners/PartnerInquiriesClient";
import type { PartnerSubmission } from "@/lib/supabase/types";

export const metadata = { title: "Partner Inquiries — Island Investors HQ" };

export default async function PartnerInquiriesPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("partner_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  const inquiries = (data ?? []) as PartnerSubmission[];

  const totalNew = inquiries.filter(i => i.status === "new").length;

  const weekCutoff = new Date();
  weekCutoff.setDate(weekCutoff.getDate() - 7);
  const thisWeek = inquiries.filter(i => new Date(i.created_at) >= weekCutoff).length;

  return (
    <>
      <TopBar title="Partner Inquiries" subtitle="Investor and buyer partner form submissions" />
      <main className="flex-1 p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total"
            value={String(inquiries.length)}
            sub="All inquiries"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Unread"
            value={String(totalNew)}
            sub="Status: new"
            trend={totalNew > 0 ? "up" : "flat"}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
          />
          <StatCard
            label="This Week"
            value={String(thisWeek)}
            sub="Last 7 days"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        <PartnerInquiriesClient inquiries={inquiries} />

      </main>
    </>
  );
}
