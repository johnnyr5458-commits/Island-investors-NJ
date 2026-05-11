import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getDbPosts, getDbPost } from "@/lib/blog-db";
import type { BlogPost } from "@/lib/supabase/types";

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  imageRotation?: number;
  imagePosition?: string;
  readTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** "file" = sourced from content/blog/*.mdx; "db" = sourced from Supabase */
  source?: "file" | "db";
}

export interface Post extends PostMeta {
  content: string;
}

const postsDir = path.join(process.cwd(), "content/blog");

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];

  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        author: data.author || "Island Investors NJ",
        tags: data.tags || [],
        image: data.image,
        readTime: data.readTime,
      } satisfies PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): Post | null {
  const mdxPath = path.join(postsDir, `${slug}.mdx`);
  const mdPath  = path.join(postsDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "Island Investors NJ",
    tags: data.tags || [],
    image: data.image,
    readTime: data.readTime,
    content,
  };
}

// ── async merged versions (file-based + Supabase DB) ──────────────────────

function dbPostToMeta(p: BlogPost): PostMeta {
  return {
    slug:           p.slug,
    title:          p.title,
    description:    p.description ?? "",
    date:           p.published_at ?? p.created_at,
    author:         p.author,
    tags:           p.tags ?? [],
    image:          p.image_url ?? undefined,
    imageRotation:  p.image_rotation ?? 0,
    imagePosition:  p.image_position ?? "center",
    readTime:       p.read_time ?? undefined,
    seoTitle:       p.seo_title ?? undefined,
    seoDescription: p.seo_description ?? undefined,
    source:         "db",
  };
}

function dbPostToPost(p: BlogPost): Post {
  return { ...dbPostToMeta(p), content: p.content };
}

export async function getAllPostsMerged(): Promise<PostMeta[]> {
  const filePosts = getAllPosts();
  const fileSlugs = new Set(filePosts.map(p => p.slug));

  const dbPosts  = await getDbPosts(false);
  const dbMapped = dbPosts
    .filter(p => !fileSlugs.has(p.slug))
    .map(dbPostToMeta);

  return [...filePosts, ...dbMapped].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostMerged(slug: string): Promise<Post | null> {
  const filePost = getPost(slug);
  if (filePost) return filePost;

  const dbPost = await getDbPost(slug);
  if (!dbPost || dbPost.status !== "published") return null;

  return dbPostToPost(dbPost);
}
