import TopBar from "@/components/hq/TopBar";
import RetrievalInterface from "@/components/hq/cadence/RetrievalInterface";
import { retrieveRecentActivity } from "@/lib/cadence-retrieval";

export const metadata = { title: "Memory — Island Investors HQ" };

export default async function CadenceRetrievePage() {
  const initialData = await retrieveRecentActivity(24, 50);

  return (
    <>
      <TopBar
        title="Memory"
        subtitle="Query operational memory — what happened, when, and how it connects"
      />
      <main className="flex-1 p-6">
        <RetrievalInterface initialData={initialData} />
      </main>
    </>
  );
}
