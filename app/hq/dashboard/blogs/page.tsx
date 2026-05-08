import TopBar from "@/components/hq/TopBar";
import HQPlaceholder from "@/app/hq/_components/HQPlaceholder";

export default function BlogsPage() {
  return (
    <>
      <TopBar title="Blog" subtitle="Create and manage Island Investors content" />
      <main className="flex-1 p-6">
        <HQPlaceholder
          title="Blog CMS"
          description="Publish and manage blog posts directly from HQ. The public blog at /blog is already live. This module will connect to the Markdown content pipeline and add a visual editor."
        />
      </main>
    </>
  );
}
