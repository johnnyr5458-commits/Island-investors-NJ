import Link from "next/link";
import TopBar from "@/components/hq/TopBar";
import BlogListClient from "@/components/hq/blog/BlogListClient";
import { getDbPosts } from "@/lib/blog-db";

export default async function BlogsPage() {
  const posts = await getDbPosts(true);
  const published = posts.filter(p => p.status === "published").length;
  const drafts    = posts.filter(p => p.status === "draft").length;

  return (
    <>
      <TopBar title="Blog" subtitle="Publish and manage Island Investors content" />
      <main className="flex-1 p-6">

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-sans text-[11px] font-bold text-silver-400 uppercase tracking-wider">
                {posts.length} total
              </span>
              <span className="mx-2 text-silver-800">·</span>
              <span className="font-sans text-[11px] text-silver-600">
                {published} published · {drafts} draft{drafts !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Link
            href="/hq/dashboard/blogs/new"
            className="flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(200,150,42,0.85)", color: "#fff" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        <BlogListClient posts={posts} />

        {/* Migration note — shown only when table appears empty due to missing setup */}
        {posts.length === 0 && (
          <div
            className="mt-6 p-4"
            style={{ background: "rgba(200,150,42,0.06)", border: "1px solid rgba(200,150,42,0.15)" }}
          >
            <p className="font-sans text-[11px] font-semibold text-gold-400 mb-1 uppercase tracking-wider">
              First-time setup
            </p>
            <p className="font-sans text-xs text-silver-600 leading-relaxed">
              Run the SQL migration in <code className="text-silver-400">supabase/blog_posts_migration.sql</code> via your
              Supabase Dashboard → SQL Editor to create the blog_posts table. Then create a public storage bucket named{" "}
              <code className="text-silver-400">blog-images</code> in Supabase Storage.
            </p>
          </div>
        )}

      </main>
    </>
  );
}
