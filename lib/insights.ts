import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getDbPosts, getDbPost } from "@/lib/blog-db";
import type { BlogPost } from "@/lib/supabase/types";

export interface InsightMeta {
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
  /** "file" = content/two-sides/*.mdx; "db" = Supabase blog_posts with category "two-sides" */
  source?: "file" | "db";
}

export interface Insight extends InsightMeta {
  content: string;
}

const insightsDir = path.join(process.cwd(), "content/two-sides");

export function getAllInsights(): InsightMeta[] {
  if (!fs.existsSync(insightsDir)) return [];

  const files = fs
    .readdirSync(insightsDir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, "");
      const raw = fs.readFileSync(path.join(insightsDir, filename), "utf-8");
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
      } satisfies InsightMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getInsight(slug: string): Insight | null {
  const mdxPath = path.join(insightsDir, `${slug}.mdx`);
  const mdPath = path.join(insightsDir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath)
    ? mdxPath
    : fs.existsSync(mdPath)
    ? mdPath
    : null;

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

function dbPostToInsightMeta(p: BlogPost): InsightMeta {
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

function dbPostToInsight(p: BlogPost): Insight {
  return { ...dbPostToInsightMeta(p), content: p.content };
}

/** Returns file-based insights + published DB posts tagged "two-sides", sorted by date. */
export async function getAllInsightsMerged(): Promise<InsightMeta[]> {
  const filePosts  = getAllInsights();
  const fileSlugs  = new Set(filePosts.map(p => p.slug));

  const dbPosts    = await getDbPosts(false);
  const dbMapped   = dbPosts
    .filter(p => (p.categories ?? []).includes("two-sides") && !fileSlugs.has(p.slug))
    .map(dbPostToInsightMeta);

  return [...filePosts, ...dbMapped].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Checks file first, then falls back to a published DB post tagged "two-sides". */
export async function getInsightMerged(slug: string): Promise<Insight | null> {
  const filePost = getInsight(slug);
  if (filePost) return filePost;

  const dbPost = await getDbPost(slug);
  if (!dbPost || dbPost.status !== "published") return null;
  if (!(dbPost.categories ?? []).includes("two-sides")) return null;

  return dbPostToInsight(dbPost);
}
