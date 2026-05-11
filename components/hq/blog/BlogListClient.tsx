"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlogPost } from "@/lib/supabase/types";
import { format } from "date-fns";

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [deleteErr,  setDeleteErr]  = useState("");

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?\n\nThis cannot be undone.`)) return;
    setDeleting(slug);
    setDeleteErr("");
    try {
      const res  = await fetch(`/api/hq/blog/posts/${slug}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setDeleteErr(json.error ?? "Delete failed. Try again.");
      }
    } catch {
      setDeleteErr("Network error. Try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (!posts.length) {
    return (
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          background: "rgba(8,22,40,0.55)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <svg
          style={{ width: "36px", height: "36px", margin: "0 auto 14px", opacity: 0.2 }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p style={{ fontSize: "13px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.45)", marginBottom: "6px" }}>
          No blog posts yet.
        </p>
        <p style={{ fontSize: "11px", fontFamily: "sans-serif", color: "rgba(148,163,184,0.28)" }}>
          Hit &ldquo;+ New Post&rdquo; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div>
      {deleteErr && (
        <div style={{ marginBottom: "10px", padding: "9px 14px", fontSize: "12px", fontFamily: "sans-serif", background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.90)" }}>
          {deleteErr}
        </div>
      )}
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {posts.map(post => (
        <div
          key={post.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "13px 16px",
            background: "rgba(8,22,40,0.55)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Status dot */}
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              flexShrink: 0,
              background: post.status === "published" ? "#34d399" : "rgba(200,150,42,0.55)",
            }}
          />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "sans-serif",
                color: "#fff",
                marginBottom: "3px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                fontSize: "10px",
                fontFamily: "sans-serif",
                color: "rgba(148,163,184,0.45)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              /blog/{post.slug}
              {post.published_at
                ? ` · ${format(new Date(post.published_at), "MMM d, yyyy")}`
                : ` · ${format(new Date(post.created_at), "MMM d, yyyy")}`}
              {post.categories?.length > 0 && ` · ${post.categories.join(", ")}`}
              {post.read_time && ` · ${post.read_time}`}
            </div>
          </div>

          {/* Status badge */}
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              padding: "2px 7px",
              fontFamily: "sans-serif",
              flexShrink: 0,
              background: post.status === "published" ? "rgba(52,211,153,0.11)" : "rgba(200,150,42,0.10)",
              border: `1px solid ${post.status === "published" ? "rgba(52,211,153,0.26)" : "rgba(200,150,42,0.22)"}`,
              color: post.status === "published" ? "rgba(52,211,153,0.82)" : "rgba(200,150,42,0.72)",
            }}
          >
            {post.status}
          </span>

          {/* View link (published only) */}
          {post.status === "published" && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "11px",
                fontFamily: "sans-serif",
                padding: "5px 10px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(148,163,184,0.50)",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              View ↗
            </a>
          )}

          {/* Edit */}
          <Link
            href={`/hq/dashboard/blogs/edit/${post.slug}`}
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              padding: "5px 10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(148,163,184,0.72)",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            Edit
          </Link>

          {/* Delete */}
          <button
            onClick={() => handleDelete(post.slug, post.title)}
            disabled={deleting === post.slug}
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              padding: "5px 10px",
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.18)",
              color: "rgba(239,68,68,0.65)",
              cursor: deleting === post.slug ? "not-allowed" : "pointer",
              opacity: deleting === post.slug ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            {deleting === post.slug ? "…" : "Delete"}
          </button>
        </div>
      ))}
    </div>
    </div>
  );
}
