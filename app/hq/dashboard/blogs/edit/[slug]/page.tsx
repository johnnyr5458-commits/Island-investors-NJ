import { notFound } from "next/navigation";
import TopBar from "@/components/hq/TopBar";
import BlogEditor from "@/components/hq/blog/BlogEditor";
import EntityTimeline from "@/components/hq/cadence/EntityTimeline";
import { getDbPost } from "@/lib/blog-db";
import { getEntityTimeline } from "@/lib/cadence";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, history] = await Promise.all([
    getDbPost(slug),
    getEntityTimeline("blog_post", slug),
  ]);
  if (!post) notFound();

  return (
    <>
      <TopBar title="Edit Post" subtitle={post.title} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <BlogEditor initialData={post} />

        {history.length > 0 && (
          <div
            style={{
              maxWidth: "760px",
              margin: "40px auto 80px",
              padding: "20px 24px",
              border: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.015)",
            }}
          >
            <EntityTimeline events={history} title="Post History" />
          </div>
        )}
      </main>
    </>
  );
}
