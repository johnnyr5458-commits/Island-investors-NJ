"use client";

import Link from "next/link";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import type { TraceableEvent, TraceableRelationship } from "@/lib/supabase/types";

const SOURCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  leads:    { bg: "rgba(20, 184, 166, 0.14)", text: "rgba(94, 234, 212, 0.90)",  label: "Leads" },
  blog:     { bg: "rgba(99, 102, 241, 0.14)", text: "rgba(165, 180, 252, 0.90)", label: "Blog" },
  partners: { bg: "rgba(168, 85, 247, 0.14)", text: "rgba(216, 180, 254, 0.90)", label: "Partners" },
};

const TYPE_LABELS: Record<string, string> = {
  "lead.received":             "Lead Received",
  "partner.inquiry_received":  "Partner Inquiry",
  "blog.created":              "Blog Created",
  "blog.updated":              "Blog Updated",
  "blog.published":            "Blog Published",
  "blog.unpublished":          "Blog Unpublished",
  "blog.deleted":              "Blog Deleted",
};

function EntityChip({ entityType, entityId }: { entityType: string | null; entityId: string | null }) {
  if (!entityType || !entityId) return null;

  let href: string | null = null;
  if (entityType === "blog_post") href = `/hq/dashboard/blogs/edit/${entityId}`;

  const chip = (
    <span
      className="inline-block text-[10px] px-1.5 py-0.5 rounded font-mono"
      style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.helper }}
    >
      {entityId}
    </span>
  );

  return href ? (
    <Link
      href={href}
      className="inline-block text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors"
      style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.muted }}
    >
      {entityId}
    </Link>
  ) : chip;
}

export function EventResult({ event }: { event: TraceableEvent }) {
  const src = SOURCE_COLORS[event.source] ?? {
    bg: "rgba(255,255,255,0.07)", text: HQ_TEXT.muted, label: event.source,
  };
  const typeLabel = TYPE_LABELS[event.type] ?? event.type;
  const isHigh = event.importance === "high";

  const ts = new Date(event.timestamp);
  const absolute = ts.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  const shortId = event.id.split("-")[0];

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* Importance dot */}
      <div className="mt-1.5 shrink-0">
        {isHigh
          ? <span className="block w-1.5 h-1.5 rounded-full" style={{ background: HQ_GOLD.bright }} />
          : <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span
            className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            style={{ background: src.bg, color: src.text }}
          >
            {src.label}
          </span>
          <span className="text-[11px] font-sans" style={{ color: HQ_TEXT.muted }}>
            {typeLabel}
          </span>
        </div>

        <p className="text-[13px] font-sans leading-snug" style={{ color: HQ_TEXT.secondary }}>
          {event.summary}
        </p>

        <div className="mt-1 flex items-center gap-2">
          {event.entity_id && (
            <EntityChip entityType={event.entity_type} entityId={event.entity_id} />
          )}
          <span className="font-mono text-[10px]" style={{ color: HQ_TEXT.disabled }}>
            #{shortId}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="shrink-0 text-right">
        <span className="text-[11px] font-sans" style={{ color: HQ_TEXT.helper }}>
          {absolute}
        </span>
      </div>
    </div>
  );
}

export function RelationshipResult({ rel }: { rel: TraceableRelationship }) {
  const depth = typeof rel.metadata?.depth === "number" ? rel.metadata.depth : null;

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      <div className="mt-1.5 shrink-0">
        <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.22)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-sans" style={{ color: HQ_TEXT.secondary }}>
          <span className="font-mono" style={{ color: HQ_TEXT.muted }}>{rel.entity_type_a}</span>
          <span style={{ color: HQ_TEXT.helper }}> / </span>
          <span className="font-mono" style={{ color: HQ_TEXT.secondary }}>{rel.entity_id_a}</span>
          <span className="mx-2" style={{ color: HQ_TEXT.helper }}>→</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-sm font-mono"
            style={{ background: "rgba(255,255,255,0.06)", color: HQ_TEXT.muted }}
          >
            {rel.relationship}
          </span>
          <span className="mx-2" style={{ color: HQ_TEXT.helper }}>→</span>
          <span className="font-mono" style={{ color: HQ_TEXT.muted }}>{rel.entity_type_b}</span>
          <span style={{ color: HQ_TEXT.helper }}> / </span>
          <span className="font-mono" style={{ color: HQ_TEXT.secondary }}>{rel.entity_id_b}</span>
        </p>

        {depth !== null && (
          <p className="text-[10px] font-sans mt-0.5" style={{ color: HQ_TEXT.disabled }}>
            depth {depth}
          </p>
        )}
      </div>
    </div>
  );
}
