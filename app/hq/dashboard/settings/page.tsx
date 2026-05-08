import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="HQ configuration and preferences" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Settings"
          description="Configure HQ preferences, notification settings, integrations, and team permissions. Role assignments and account management coming in the next module."
        />
      </main>
    </>
  );
}
