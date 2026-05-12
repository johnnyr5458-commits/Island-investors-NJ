import { Suspense } from "react";
import TopBar from "@/components/hq/TopBar";
import AnalyticsClient from "@/components/hq/analytics/AnalyticsClient";
import AnalyticsSkeleton from "@/components/hq/analytics/AnalyticsSkeleton";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";

export const metadata = { title: "Analytics — Island Investors HQ" };

export default async function AnalyticsPage() {
  const submissions = await getSubmissionCounts("7d");

  const initialData = {
    range: "7d" as const,
    ga4Configured: false,
    submissions: {
      seller: submissions.seller,
      partner: submissions.partner,
      conversionRate: null,
    },
  };

  return (
    <>
      <TopBar title="Analytics" subtitle="Traffic, conversions & performance" />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsClient initialData={initialData} initialRange="7d" />
      </Suspense>
    </>
  );
}
