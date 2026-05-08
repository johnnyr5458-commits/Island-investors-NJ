import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function PropertiesPage() {
  return (
    <>
      <TopBar title="Properties" subtitle="Active deals, acquisition pipeline, and portfolio" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Property Pipeline"
          description="Track active acquisitions, deals under evaluation, and closed properties. This module will support deal stages, document attachments, and partner assignment."
        />
      </main>
    </>
  );
}
