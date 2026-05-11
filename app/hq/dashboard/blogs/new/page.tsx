import TopBar from "@/components/hq/TopBar";
import BlogEditor from "@/components/hq/blog/BlogEditor";

export default function NewBlogPostPage() {
  return (
    <>
      <TopBar title="New Blog Post" subtitle="Write and publish to the Island Investors blog" />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <BlogEditor />
      </main>
    </>
  );
}
