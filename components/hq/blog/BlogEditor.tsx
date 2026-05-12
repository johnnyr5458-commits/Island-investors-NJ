"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/lib/supabase/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const CATEGORIES: { id: string; label: string }[] = [
  { id: "Two Sides",      label: "Two Sides" },
  { id: "for-homeowners", label: "For Homeowners" },
  { id: "for-investors",  label: "For Investors" },
];

const POSITIONS = [
  { value: "top center",    label: "Top" },
  { value: "center",        label: "Center" },
  { value: "bottom center", label: "Bottom" },
];

function slugify(t: string) {
  return t.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function inlineMarkdown(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, `<code style="background:rgba(255,255,255,0.10);padding:1px 5px;border-radius:2px;font-size:12px">$1</code>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" style="color:rgba(200,150,42,0.90)">$1</a>`);
}

function renderPreview(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  let para = "";

  const flushPara = () => {
    if (para.trim()) {
      out.push(`<p style="margin:0 0 14px;line-height:1.75">${inlineMarkdown(para.trim())}</p>`);
      para = "";
    }
  };

  for (const raw of lines) {
    if (/^### /.test(raw)) {
      if (inList) { out.push("</ul>"); inList = false; } flushPara();
      out.push(`<h3 style="font-size:15px;font-weight:700;color:#fff;margin:22px 0 8px">${inlineMarkdown(raw.slice(4))}</h3>`);
    } else if (/^## /.test(raw)) {
      if (inList) { out.push("</ul>"); inList = false; } flushPara();
      out.push(`<h2 style="font-size:19px;font-weight:700;color:#fff;margin:28px 0 10px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08)">${inlineMarkdown(raw.slice(3))}</h2>`);
    } else if (/^# /.test(raw)) {
      if (inList) { out.push("</ul>"); inList = false; } flushPara();
      out.push(`<h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 16px">${inlineMarkdown(raw.slice(2))}</h1>`);
    } else if (/^[-*] /.test(raw)) {
      flushPara();
      if (!inList) { out.push(`<ul style="margin:0 0 14px;padding-left:20px;line-height:1.7">`); inList = true; }
      out.push(`<li style="margin-bottom:5px;color:rgba(226,232,240,0.85)">${inlineMarkdown(raw.slice(2))}</li>`);
    } else if (raw.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; } flushPara();
    } else {
      if (inList) { out.push("</ul>"); inList = false; }
      para += (para ? " " : "") + raw;
    }
  }
  if (inList) out.push("</ul>");
  flushPara();
  return out.join("\n");
}

// Resize + re-compress on the client before upload so large mobile photos (often 8–15 MB)
// never hit Vercel's 4.5 MB serverless payload limit. Falls back to the original file on
// any canvas error (e.g. HEIC on non-Safari) so the upload path is never blocked.
async function compressImage(file: File): Promise<File> {
  const MAX_PX = 1600;
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_PX / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
      const w = Math.round((img.naturalWidth || MAX_PX) * scale);
      const h = Math.round((img.naturalHeight || MAX_PX) * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => resolve(
          blob ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file
        ),
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

/** CSS for the hero image that matches exactly how it's displayed on the published post. */
function heroImgStyle(rotation: number, position: string): React.CSSProperties {
  const swapped = rotation === 90 || rotation === 270;
  if (!swapped) {
    return {
      width: "100%",
      height: "190px",
      objectFit: "cover",
      objectPosition: position,
      transform: rotation ? `rotate(${rotation}deg)` : undefined,
      display: "block",
    };
  }
  // For portrait→landscape: swap dimensions via absolute positioning then rotate.
  // height: 100vw ensures the image is always wide enough to fill the container after rotation.
  return {
    position: "absolute",
    width: "190px",
    height: "100vw",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    objectFit: "cover",
    objectPosition: position,
  };
}

// ─── styles ─────────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: "#fff",
  fontSize: "16px",
  borderRadius: "2px",
  width: "100%",
  outline: "none",
  padding: "11px 14px",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelBase: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.13em",
  color: "rgba(148,163,184,0.55)",
  marginBottom: "7px",
  fontFamily: "sans-serif",
};

// ─── component ──────────────────────────────────────────────────────────────

interface Props {
  initialData?: Partial<BlogPost>;
}

export default function BlogEditor({ initialData }: Props) {
  const router = useRouter();
  const isEditing = !!initialData?.id;
  const draftKey = `blog-draft-${initialData?.slug ?? "new"}`;

  const [title,          setTitle]          = useState(initialData?.title            ?? "");
  const [slug,           setSlug]           = useState(initialData?.slug             ?? "");
  const [slugLocked,     setSlugLocked]     = useState(isEditing);
  const [excerpt,        setExcerpt]        = useState(initialData?.description      ?? "");
  const [content,        setContent]        = useState(initialData?.content          ?? "");
  const [imageUrl,       setImageUrl]       = useState(initialData?.image_url        ?? "");
  const [imageRotation,  setImageRotation]  = useState(initialData?.image_rotation   ?? 0);
  const [imagePosition,  setImagePosition]  = useState(initialData?.image_position   ?? "center");
  const [seoTitle,       setSeoTitle]       = useState(initialData?.seo_title        ?? "");
  const [seoMeta,        setSeoMeta]        = useState(initialData?.seo_description  ?? "");
  const [categories,     setCategories]     = useState<Set<string>>(
    new Set(initialData?.categories ?? [])
  );
  const [status, setStatus] = useState<"draft" | "published">(initialData?.status ?? "draft");

  const [showPreview, setShowPreview] = useState(false);
  const [showSeo,     setShowSeo]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [uploadBusy,  setUploadBusy]  = useState(false);
  const [uploadErr,   setUploadErr]   = useState("");
  const [apiError,    setApiError]    = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");
  const [lastSaved,   setLastSaved]   = useState("");
  const [dragActive,  setDragActive]  = useState(false);

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-generate slug from title (while unlocked)
  useEffect(() => {
    if (!slugLocked && title) setSlug(slugify(title));
  }, [title, slugLocked]);

  // Autosave to localStorage (debounced 2s)
  const triggerAutosave = useCallback(() => {
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({
          title, slug, excerpt, content, imageUrl, imageRotation, imagePosition,
          seoTitle, seoMeta, categories: [...categories],
          savedAt: new Date().toISOString(),
        }));
        setLastSaved(`Autosaved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      } catch { /* storage full */ }
    }, 2000);
  }, [title, slug, excerpt, content, imageUrl, imageRotation, imagePosition, seoTitle, seoMeta, categories, draftKey]);

  useEffect(() => { triggerAutosave(); }, [triggerAutosave]);

  // Restore draft from localStorage on mount (new posts only)
  useEffect(() => {
    if (isEditing) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title)         setTitle(d.title);
      if (d.slug)          { setSlug(d.slug); setSlugLocked(true); }
      if (d.excerpt)       setExcerpt(d.excerpt);
      if (d.content)       setContent(d.content);
      if (d.imageUrl)      setImageUrl(d.imageUrl);
      if (d.imageRotation) setImageRotation(d.imageRotation);
      if (d.imagePosition) setImagePosition(d.imagePosition);
      if (d.seoTitle)      setSeoTitle(d.seoTitle);
      if (d.seoMeta)       setSeoMeta(d.seoMeta);
      if (d.categories)    setCategories(new Set(d.categories));
      const t = d.savedAt
        ? new Date(d.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      if (t) setLastSaved(`Draft restored from ${t}`);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) { setUploadErr("Please select an image file."); return; }
    setUploadErr("");
    setUploadBusy(true);
    try {
      // Compress files over 1 MB before upload — prevents Vercel's 4.5 MB payload limit
      // from returning a plain-text 413 that breaks JSON parsing.
      const toUpload = file.size > 1_000_000 ? await compressImage(file) : file;

      const fd = new FormData();
      fd.append("file", toUpload);
      const res = await fetch("/api/hq/blog/upload", { method: "POST", body: fd });

      // Platform-level errors (e.g. Vercel 413) arrive as plain text, not JSON.
      let json: { url?: string; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        if (res.status === 413) throw new Error("Photo is too large — try a different image.");
        throw new Error(`Upload failed (${res.status})`);
      }

      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      setImageUrl(json.url!);
      setImageRotation(0);
      setImagePosition("center");
    } catch (e) {
      setUploadErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  function rotate(dir: "left" | "right") {
    setImageRotation(r => ((r + (dir === "right" ? 90 : -90) + 360) % 360));
  }

  async function save(targetStatus: "draft" | "published") {
    if (!title.trim()) { setApiError("Title is required."); return; }
    if (!slug.trim())  { setApiError("Slug is required."); return; }
    if (targetStatus === "published" && !content.trim()) {
      setApiError("Content is required before publishing."); return;
    }

    setSaving(true);
    setApiError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/hq/blog/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           title.trim(),
          description:     excerpt.trim() || null,
          content,
          image_url:       imageUrl || null,
          image_rotation:  imageRotation,
          image_position:  imagePosition,
          seo_title:       seoTitle.trim() || null,
          seo_description: seoMeta.trim() || null,
          categories:      [...categories],
          tags:            [],
          status:          targetStatus,
          author:          "Island Investors NJ",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Show the real server error, not a generic message
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      setStatus(targetStatus);
      setSlugLocked(true);
      localStorage.removeItem(draftKey);

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (targetStatus === "published") {
        setSuccessMsg("Published! Redirecting…");
        setTimeout(() => router.push("/hq/dashboard/blogs"), 1200);
      } else {
        setLastSaved(`Saved draft at ${now}`);
        setSuccessMsg("Draft saved.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(id: string) {
    setCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime  = wordCount > 0 ? calcReadTime(content) : null;

  const imgStyle = heroImgStyle(imageRotation, imagePosition);

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", paddingBottom: "80px" }}>

      {/* ── sticky action bar ── */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 -mx-4 mb-5"
        style={{
          background: "rgba(5,13,25,0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/hq/dashboard/blogs")}
            style={{ fontSize: "12px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.55)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            ← Posts
          </button>
          <span style={{
            fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em",
            padding: "2px 7px", fontFamily: "sans-serif",
            background: status === "published" ? "rgba(52,211,153,0.12)" : "rgba(200,150,42,0.10)",
            border: `1px solid ${status === "published" ? "rgba(52,211,153,0.28)" : "rgba(200,150,42,0.22)"}`,
            color: status === "published" ? "rgba(52,211,153,0.85)" : "rgba(200,150,42,0.72)",
          }}>
            {status}
          </span>
          {lastSaved && (
            <span className="hidden sm:block truncate" style={{ fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.35)" }}>
              {lastSaved}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowPreview(v => !v)}
            style={{
              fontSize: "12px", fontFamily: "sans-serif", fontWeight: 600, padding: "7px 12px",
              background: showPreview ? "rgba(200,150,42,0.14)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showPreview ? "rgba(200,150,42,0.28)" : "rgba(255,255,255,0.10)"}`,
              color: showPreview ? "rgba(200,150,42,0.90)" : "rgba(148,163,184,0.70)", cursor: "pointer",
            }}
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => save("draft")} disabled={saving}
            style={{
              fontSize: "12px", fontFamily: "sans-serif", fontWeight: 600, padding: "7px 12px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(148,163,184,0.80)", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "…" : "Save Draft"}
          </button>
          <button
            onClick={() => save("published")} disabled={saving || !title || !content}
            style={{
              fontSize: "12px", fontFamily: "sans-serif", fontWeight: 700, padding: "7px 14px",
              background: "rgba(200,150,42,0.85)", border: "1px solid rgba(200,150,42,0.95)",
              color: "#fff", cursor: (saving || !title || !content) ? "not-allowed" : "pointer",
              opacity: (saving || !title || !content) ? 0.45 : 1,
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* ── status messages ── */}
      {apiError && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", fontSize: "12px", fontFamily: "sans-serif", background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.90)", lineHeight: "1.5" }}>
          <strong>Error:</strong> {apiError}
        </div>
      )}
      {successMsg && (
        <div style={{ marginBottom: "16px", padding: "10px 14px", fontSize: "12px", fontFamily: "sans-serif", background: "rgba(52,211,153,0.09)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.90)" }}>
          {successMsg}
        </div>
      )}

      {/* ═══════════════════════════════════════════════ PREVIEW ══ */}
      {showPreview ? (
        <div style={{ padding: "28px 24px", background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.07)", minHeight: "400px", color: "rgba(226,232,240,0.88)" }}>
          {imageUrl && (
            <div style={{ position: "relative", overflow: "hidden", height: "190px", marginBottom: "24px", borderRadius: "2px" }}>
              <img src={imageUrl} alt={title} style={heroImgStyle(imageRotation, imagePosition)} />
            </div>
          )}
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: "12px" }}>
            {title || <span style={{ opacity: 0.3 }}>Untitled</span>}
          </h1>
          {excerpt && <p style={{ fontSize: "15px", color: "rgba(148,163,184,0.78)", lineHeight: 1.65, marginBottom: "24px" }}>{excerpt}</p>}
          {readTime && <p style={{ fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.45)", marginBottom: "24px" }}>{readTime} · {wordCount} words</p>}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "24px" }}>
            <div style={{ fontSize: "14px", lineHeight: "1.75", color: "rgba(226,232,240,0.85)" }}
              dangerouslySetInnerHTML={{ __html: content ? renderPreview(content) : `<p style="opacity:0.3;font-style:italic">No content yet.</p>` }}
            />
          </div>
        </div>

      ) : (
      /* ═══════════════════════════════════════════════ EDITOR ══ */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── Hero image ── */}
          <div>
            <label style={labelBase}>Hero Image</label>

            {/* Drop zone / image preview — no persistent overlay so rotation is visible */}
            {!imageUrl ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => {
                  e.preventDefault(); setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? "rgba(200,150,42,0.65)" : "rgba(255,255,255,0.13)"}`,
                  borderRadius: "2px",
                  background: dragActive ? "rgba(200,150,42,0.04)" : "rgba(255,255,255,0.02)",
                  height: "116px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ textAlign: "center", padding: "20px 16px" }}>
                  {uploadBusy ? (
                    <div style={{ fontSize: "13px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.55)" }}>Uploading &amp; optimizing…</div>
                  ) : (
                    <>
                      <svg style={{ width: "26px", height: "26px", margin: "0 auto 8px", opacity: 0.3 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div style={{ fontSize: "13px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.65)", marginBottom: "4px" }}>Tap to add hero image</div>
                      <div style={{ fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.35)" }}>Drag &amp; drop or tap · Auto-corrected &amp; compressed</div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Clean preview — overlay removed so rotation/position result is clearly visible */
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => {
                  e.preventDefault(); setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageFile(file);
                }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: "190px",
                  borderRadius: "2px",
                  border: dragActive ? "2px dashed rgba(200,150,42,0.65)" : "none",
                }}
              >
                <img src={imageUrl} alt="Hero" style={imgStyle} />
              </div>
            )}

            {/* Controls row — shown when image is uploaded */}
            {imageUrl && (
              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>

                {/* Change / Remove */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: "11px", fontFamily: "sans-serif", padding: "5px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(148,163,184,0.80)", cursor: "pointer", borderRadius: "2px" }}
                >
                  Change
                </button>
                <button
                  onClick={() => { setImageUrl(""); setImageRotation(0); setImagePosition("center"); }}
                  style={{ fontSize: "11px", fontFamily: "sans-serif", padding: "5px 10px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", color: "rgba(239,68,68,0.75)", cursor: "pointer", borderRadius: "2px" }}
                >
                  Remove
                </button>

                <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

                {/* Rotate */}
                <button
                  onClick={() => rotate("left")} title="Rotate left 90°"
                  style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontFamily: "sans-serif", padding: "5px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(148,163,184,0.75)", cursor: "pointer", borderRadius: "2px" }}
                >
                  <span style={{ fontSize: "13px", lineHeight: 1 }}>↺</span> L
                </button>
                <button
                  onClick={() => rotate("right")} title="Rotate right 90°"
                  style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontFamily: "sans-serif", padding: "5px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(148,163,184,0.75)", cursor: "pointer", borderRadius: "2px" }}
                >
                  <span style={{ fontSize: "13px", lineHeight: 1 }}>↻</span> R
                </button>
                {imageRotation !== 0 && (
                  <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: "rgba(200,150,42,0.60)" }}>{imageRotation}°</span>
                )}

                <span style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

                {/* Focus position */}
                <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.40)", flexShrink: 0 }}>Crop:</span>
                {POSITIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setImagePosition(p.value)}
                    style={{
                      fontSize: "11px", fontFamily: "sans-serif", padding: "5px 10px", cursor: "pointer", borderRadius: "2px",
                      background: imagePosition === p.value ? "rgba(200,150,42,0.14)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${imagePosition === p.value ? "rgba(200,150,42,0.35)" : "rgba(255,255,255,0.10)"}`,
                      color: imagePosition === p.value ? "rgba(200,150,42,0.90)" : "rgba(148,163,184,0.65)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {uploadBusy && imageUrl === "" && null /* spinner shown in dropzone */}
            {uploadBusy && imageUrl !== "" && (
              <div style={{ marginTop: "6px", fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.55)" }}>Uploading…</div>
            )}
            {uploadErr && (
              <div style={{ marginTop: "6px", fontSize: "11px", fontFamily: "sans-serif", color: "rgba(239,68,68,0.85)" }}>{uploadErr}</div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
            />
          </div>

          {/* ── Title ── */}
          <div>
            <label style={labelBase}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title…"
              style={{ ...inputBase, fontSize: "20px", fontWeight: 500, padding: "13px 14px" }} />
          </div>

          {/* ── Slug ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
              <label style={{ ...labelBase, marginBottom: 0 }}>URL Slug</label>
              <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.38)" }}>
                {slugLocked ? "🔒 locked" : "auto from title"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.38)", whiteSpace: "nowrap" }}>/blog/</span>
              <input type="text" value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugLocked(true); }}
                readOnly={isEditing && status === "published"}
                placeholder="url-slug"
                style={{ ...inputBase, flex: 1, fontFamily: "ui-monospace, monospace", fontSize: "14px" }} />
            </div>
          </div>

          {/* ── Excerpt ── */}
          <div>
            <label style={labelBase}>Excerpt / Summary</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)}
              placeholder="1–2 sentence summary shown in the blog feed and search results…"
              rows={2} style={{ ...inputBase, resize: "vertical", lineHeight: "1.6" }} />
          </div>

          {/* ── Categories ── */}
          <div>
            <label style={labelBase}>Categories</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORIES.map(({ id, label }) => {
                const checked = categories.has(id);
                return (
                  <label key={id} style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px",
                    background: checked ? "rgba(200,150,42,0.08)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${checked ? "rgba(200,150,42,0.28)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "2px", cursor: "pointer", userSelect: "none",
                    fontSize: "13px", fontFamily: "sans-serif",
                    color: checked ? "rgba(200,150,42,0.92)" : "rgba(148,163,184,0.70)",
                  }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCategory(id)}
                      style={{ accentColor: "rgba(200,150,42,0.85)", width: "16px", height: "16px", cursor: "pointer" }} />
                    {label}
                  </label>
                );
              })}
            </div>
            <p style={{ marginTop: "7px", fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.35)" }}>
              Posts always appear in the main blog feed regardless of category.
            </p>
          </div>

          {/* ── Content ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
              <label style={{ ...labelBase, marginBottom: 0 }}>Content *</label>
              <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.38)" }}>
                {wordCount > 0 ? `${wordCount} words · ${readTime}` : "Markdown supported"}
              </span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder={"Start writing…\n\nMarkdown supported:\n## Section Heading\n**Bold text**  *Italic text*\n- Bullet item\n[Link](https://example.com)"}
              rows={24} style={{ ...inputBase, resize: "vertical", lineHeight: "1.70", fontFamily: "ui-monospace, 'Cascadia Code', Menlo, monospace", fontSize: "14px" }} />
            <p style={{ marginTop: "6px", fontSize: "10px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.30)" }}>
              # H1 · ## H2 · ### H3 · **bold** · *italic* · [text](url) · - list
            </p>
          </div>

          {/* ── SEO (collapsible) ── */}
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "2px", overflow: "hidden" }}>
            <button onClick={() => setShowSeo(v => !v)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "12px 16px", background: "rgba(8,22,40,0.55)", border: "none", cursor: "pointer",
            }}>
              <span style={{ ...labelBase, marginBottom: 0, color: (seoTitle || seoMeta) ? "rgba(200,150,42,0.70)" : "rgba(148,163,184,0.55)" }}>
                SEO Settings {(seoTitle || seoMeta) ? "✓" : "(optional)"}
              </span>
              <span style={{ fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.40)" }}>{showSeo ? "▲" : "▼"}</span>
            </button>
            {showSeo && (
              <div style={{ padding: "16px", background: "rgba(8,22,40,0.30)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                    <label style={{ ...labelBase, marginBottom: 0 }}>SEO Title</label>
                    <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: seoTitle.length > 60 ? "rgba(239,68,68,0.80)" : "rgba(148,163,184,0.38)" }}>
                      {seoTitle.length} / 60
                    </span>
                  </div>
                  <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)}
                    placeholder={title || "Defaults to post title"} maxLength={80} style={inputBase} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                    <label style={{ ...labelBase, marginBottom: 0 }}>Meta Description</label>
                    <span style={{ fontSize: "10px", fontFamily: "sans-serif", color: seoMeta.length > 155 ? "rgba(239,68,68,0.80)" : "rgba(148,163,184,0.38)" }}>
                      {seoMeta.length} / 155
                    </span>
                  </div>
                  <textarea value={seoMeta} onChange={e => setSeoMeta(e.target.value)}
                    placeholder={excerpt || "Defaults to excerpt if blank"} rows={2} maxLength={200}
                    style={{ ...inputBase, resize: "none" }} />
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
