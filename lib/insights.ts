import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface InsightMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  readTime?: string;
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
