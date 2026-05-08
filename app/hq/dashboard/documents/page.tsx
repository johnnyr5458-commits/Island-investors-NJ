import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function DocumentsPage() {
  return (
    <>
      <TopBar title="Documents" subtitle="Contracts, disclosures, and deal files" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Document Vault"
          description="Secure storage for contracts, purchase agreements, disclosures, and closing documents. Files will be organized by deal and accessible to authorized partners."
        />
      </main>
    </>
  );
}
