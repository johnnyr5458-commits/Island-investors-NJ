import { notFound } from "next/navigation";
import TopBar from "@/components/hq/TopBar";
import BlogEditor from "@/components/hq/blog/BlogEditor";
import { getDbPost } from "@/lib/blog-db";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getDbPost(slug);
  if (!post) notFound();

  return (
    <>
      <TopBar title="Edit Post" subtitle={post.title} />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <BlogEditor initialData={post} />
      </main>
    </>
  );
}
