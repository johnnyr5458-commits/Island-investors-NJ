import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import sharp from "sharp";

const BUCKET = "blog-images";

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

export async function POST(req: NextRequest) {
  const user = await requireHQAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Image file required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let processed: Buffer;
  try {
    processed = await sharp(inputBuffer)
      .rotate()                                     // auto-correct EXIF orientation (phone cameras)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (e) {
    console.error("[blog/upload] sharp error:", e);
    return NextResponse.json({ error: "Image processing failed" }, { status: 500 });
  }

  const filename = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const admin = createAdminClient();

  // Create bucket if it doesn't exist (ignored if already exists)
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(filename, processed, { contentType: "image/webp", upsert: false });

  if (uploadError) {
    console.error("[blog/upload]", uploadError);
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
