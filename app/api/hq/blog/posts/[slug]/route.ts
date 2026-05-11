import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDbPost, upsertDbPost, deleteDbPost } from "@/lib/blog-db";
import { revalidatePath } from "next/cache";

async function requireHQAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string } | null; error: unknown };
  if (!profile || profile.status !== "active" || !["admin", "team"].includes(profile.role)) return null;
  return user;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const post = await getDbPost(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title) {
    return NextResponse.json({ error: "Title is required" }, { status: 422 });
  }

  const isPublishing = body.status === "published";
  const existing = await getDbPost(slug);

  const payload = {
    ...body,
    slug,
    image_rotation: typeof body.image_rotation === "number" ? body.image_rotation : 0,
    image_position: typeof body.image_position === "string" ? body.image_position : "center",
    read_time: typeof body.content === "string" && body.content
      ? calcReadTime(body.content)
      : (existing?.read_time ?? null),
    published_at: isPublishing
      ? (existing?.published_at ?? new Date().toISOString())
      : (existing?.published_at ?? null),
  };

  console.log("[blog/posts] PUT slug=%s status=%s user=%s", slug, body.status, user.id);

  const { data: post, error } = await upsertDbPost(
    payload as Parameters<typeof upsertDbPost>[0]
  );

  if (error || !post) {
    const detail = error ?? "upsert returned no data";
    console.error("[blog/posts] PUT failed:", detail);

    // Give a helpful hint when the table is missing
    const hint = detail.includes("does not exist")
      ? "Run supabase/blog_posts_migration.sql in your Supabase SQL Editor first."
      : detail;

    return NextResponse.json({ error: hint }, { status: 500 });
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const ok = await deleteDbPost(slug);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ ok: true });
}

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
