import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function LeadsPage() {
  return (
    <>
      <TopBar title="Leads" subtitle="Incoming seller and homeowner inquiries" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Lead Management"
          description="Seller and homeowner leads from the contact form will appear here. Connect your Formspree webhook or database to populate this module."
        />
      </main>
    </>
  );
}
