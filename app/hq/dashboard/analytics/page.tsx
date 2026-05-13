import { Suspense } from "react";
import TopBar from "@/components/hq/TopBar";
import AnalyticsClient from "@/components/hq/analytics/AnalyticsClient";
import AnalyticsSkeleton from "@/components/hq/analytics/AnalyticsSkeleton";
import { getSubmissionCounts } from "@/lib/supabase/analytics-queries";
import { ga4IsConfigured, getGa4Overview, getGa4Sources, getGa4Devices, getGa4TopPages, getGa4Geo } from "@/lib/ga4";

export const metadata = { title: "Analytics — Island Investors HQ" };

export default async function AnalyticsPage() {
  const configured = ga4IsConfigured();

  const [submissions, overview, sources, devices, topPages, geo] = await Promise.all([
    getSubmissionCounts("7d"),
    configured ? getGa4Overview("7d") : Promise.resolve(null),
    configured ? getGa4Sources("7d")  : Promise.resolve(null),
    configured ? getGa4Devices("7d")  : Promise.resolve(null),
    configured ? getGa4TopPages("7d") : Promise.resolve(null),
    configured ? getGa4Geo("7d")      : Promise.resolve(null),
  ]);

  const sessions = overview?.sessions ?? 0;
  const totalSubmissions = submissions.seller + submissions.partner;
  const conversionRate = sessions > 0
    ? `${((totalSubmissions / sessions) * 100).toFixed(2)}%`
    : null;

  const initialData = {
    range: "7d" as const,
    ga4Configured: configured,
    overview: overview ?? null,
    sources: sources ?? null,
    devices: devices ?? null,
    topPages: topPages ?? null,
    geo: geo ?? null,
    submissions: {
      seller: submissions.seller,
      partner: submissions.partner,
      conversionRate,
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
