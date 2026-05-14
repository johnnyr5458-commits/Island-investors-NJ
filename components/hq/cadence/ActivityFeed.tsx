"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { CadenceEvent } from "@/lib/supabase/types";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

const SOURCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  leads:    { bg: "rgba(20, 184, 166, 0.14)", text: "rgba(94, 234, 212, 0.90)", label: "Leads" },
  blog:     { bg: "rgba(99, 102, 241, 0.14)", text: "rgba(165, 180, 252, 0.90)", label: "Blog" },
  partners: { bg: "rgba(168, 85, 247, 0.14)", text: "rgba(216, 180, 254, 0.90)", label: "Partners" },
};

const TYPE_LABELS: Record<string, string> = {
  "lead.received":              "Lead Received",
  "partner.inquiry_received":   "Partner Inquiry",
  "blog.created":               "Blog Created",
  "blog.updated":               "Blog Updated",
  "blog.published":             "Blog Published",
  "blog.unpublished":           "Blog Unpublished",
  "blog.deleted":               "Blog Deleted",
};

function EntityLink({ event }: { event: CadenceEvent }) {
  if (!event.entity_type || !event.entity_id) return null;

  let href: string | null = null;
  let label = event.entity_id;

  if (event.entity_type === "blog_post") {
    href = `/hq/dashboard/blogs/edit/${event.entity_id}`;
    label = event.entity_id;
  }

  if (!href) {
    return (
      <span
        className="inline-block text-[10px] px-1.5 py-0.5 rounded font-mono"
        style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.helper }}
      >
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-block text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors"
      style={{ background: "rgba(255,255,255,0.05)", color: HQ_TEXT.muted }}
    >
      {label}
    </Link>
  );
}

function EventRow({ event }: { event: CadenceEvent }) {
  const src = SOURCE_COLORS[event.source] ?? { bg: "rgba(255,255,255,0.07)", text: HQ_TEXT.muted, label: event.source };
  const typeLabel = TYPE_LABELS[event.type] ?? event.type;
  const isHigh = event.importance === "high";
  const ts = new Date(event.timestamp);
  const relative = formatDistanceToNow(ts, { addSuffix: true });
  const absolute = ts.toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 border-b transition-colors"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* Importance dot */}
      <div className="mt-1.5 shrink-0">
        {isHigh
          ? <span className="block w-1.5 h-1.5 rounded-full" style={{ background: HQ_GOLD.bright }} />
          : <span className="block w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
        }
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {/* Source badge */}
          <span
            className="text-[10px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            style={{ background: src.bg, color: src.text }}
          >
            {src.label}
          </span>
          {/* Event type label */}
          <span className="text-[11px] font-sans" style={{ color: HQ_TEXT.muted }}>
            {typeLabel}
          </span>
        </div>

        {/* Summary */}
        <p className="text-[13px] font-sans leading-snug truncate" style={{ color: HQ_TEXT.secondary }}>
          {event.summary}
        </p>

        {/* Entity chip */}
        {event.entity_id && (
          <div className="mt-1">
            <EntityLink event={event} />
          </div>
        )}
      </div>

      {/* Timestamp */}
      <div className="shrink-0 text-right" title={absolute}>
        <span className="text-[11px] font-sans" style={{ color: HQ_TEXT.helper }}>
          {relative}
        </span>
      </div>
    </div>
  );
}

export default function ActivityFeed({ events }: { events: CadenceEvent[] }) {
  if (events.length === 0) {
    return (
      <div
        className="rounded-sm border px-6 py-12 text-center"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
      >
        <p className="text-sm font-sans" style={{ color: HQ_TEXT.muted }}>
          No activity recorded yet.
        </p>
        <p className="text-xs font-sans mt-1" style={{ color: HQ_TEXT.helper }}>
          Events will appear here as operational activity occurs.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-sm border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
    >
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
