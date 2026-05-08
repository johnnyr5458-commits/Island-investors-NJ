import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function TasksPage() {
  return (
    <>
      <TopBar title="Tasks" subtitle="Internal workflow and to-do management" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Task Board"
          description="Manage team tasks, deal checklists, and follow-up workflows. Assign tasks by property, partner, or team member. Future integration with ARGOS and notification system."
        />
      </main>
    </>
  );
}
