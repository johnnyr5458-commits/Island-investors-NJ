import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function AnalyticsPage() {
  return (
    <>
      <TopBar title="Analytics" subtitle="Traffic, conversions, and performance metrics" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Analytics Dashboard"
          description="GA4 is installed and collecting data. Connect the Google Analytics Data API to display live metrics — sessions, conversion rate, top pages, and lead sources — directly in HQ."
        />
      </main>
    </>
  );
}
