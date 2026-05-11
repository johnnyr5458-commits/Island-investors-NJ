import { createAdminClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/supabase/types";

type AnyClient = ReturnType<typeof createAdminClient>;

function table(supabase: AnyClient) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from("blog_posts");
}

const TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("db_timeout")), ms)
    ),
  ]);
}

export async function getDbPosts(includeUnpublished = false): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    let q = table(supabase)
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });
    if (!includeUnpublished) q = q.eq("status", "published");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await withTimeout(q, TIMEOUT_MS) as any;
    if (error) return [];
    return (data as BlogPost[]) ?? [];
  } catch {
    return [];
  }
}

export async function getDbPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await withTimeout(
      table(supabase).select("*").eq("slug", slug).single(),
      TIMEOUT_MS
    ) as any;
    return (data as BlogPost) ?? null;
  } catch {
    return null;
  }
}

export interface UpsertResult {
  data: BlogPost | null;
  error: string | null;
}

export async function upsertDbPost(
  post: Partial<BlogPost> & { slug: string }
): Promise<UpsertResult> {
  try {
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (table(supabase)
      .upsert(post, { onConflict: "slug" })
      .select()
      .single() as any);

    if (error) {
      const msg: string = (error as { message?: string }).message ?? String(error);
      console.error("[blog-db] upsertDbPost error:", msg, "| slug:", post.slug);
      return { data: null, error: msg };
    }

    return { data: data as BlogPost, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[blog-db] upsertDbPost exception:", msg, "| slug:", post.slug);
    return { data: null, error: msg };
  }
}

export async function deleteDbPost(slug: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { error } = await table(supabase).delete().eq("slug", slug);
    if (error) console.error("[blog-db] deleteDbPost error:", error.message);
    return !error;
  } catch {
    return false;
  }
}
