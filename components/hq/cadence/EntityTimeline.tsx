import { formatDistanceToNow } from "date-fns";
import type { CadenceEvent } from "@/lib/supabase/types";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

const TYPE_LABELS: Record<string, string> = {
  "lead.received":            "Lead received",
  "partner.inquiry_received": "Partner inquiry received",
  "blog.created":             "Created",
  "blog.updated":             "Updated",
  "blog.published":           "Published",
  "blog.unpublished":         "Unpublished",
  "blog.deleted":             "Deleted",
};

const TYPE_DOT: Record<string, string> = {
  "blog.published":           "rgba(52,211,153,0.80)",
  "blog.created":             "rgba(232,186,76,0.80)",
  "lead.received":            "rgba(232,186,76,0.80)",
  "partner.inquiry_received": "rgba(168,85,247,0.65)",
};

interface Props {
  events: CadenceEvent[];
  title?: string;
}

export default function EntityTimeline({ events, title = "History" }: Props) {
  if (events.length === 0) {
    return (
      <div
        className="px-4 py-3.5"
        style={{
          border: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <p className="text-[11px] font-sans" style={{ color: HQ_TEXT.helper }}>
          No history recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p
        className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-3"
        style={{ color: HQ_TEXT.helper }}
      >
        {title}
      </p>

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[5px] top-2 bottom-2 w-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />

        <div className="space-y-0">
          {events.map((event, i) => {
            const ts = new Date(event.timestamp);
            const relative = formatDistanceToNow(ts, { addSuffix: true });
            const absolute = ts.toLocaleString("en-US", {
              timeZone: "America/New_York",
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
            const dotColor = TYPE_DOT[event.type] ?? "rgba(255,255,255,0.20)";
            const label = TYPE_LABELS[event.type] ?? event.type;
            const isLast = i === events.length - 1;

            return (
              <div key={event.id} className="flex gap-4 pl-1">
                {/* Dot */}
                <div className="flex flex-col items-center shrink-0 mt-1">
                  <span
                    className="block w-2.5 h-2.5 rounded-full border-2 shrink-0"
                    style={{
                      background: dotColor,
                      borderColor: "#050d19",
                      boxShadow: `0 0 0 1px ${dotColor}`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className={`pb-4 min-w-0 flex-1 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[12px] font-sans font-medium"
                      style={{ color: HQ_TEXT.secondary }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[10px] font-sans shrink-0"
                      style={{ color: HQ_TEXT.helper }}
                      title={absolute}
                    >
                      {relative}
                    </span>
                  </div>
                  {event.actor && event.actor !== "system" && (
                    <p
                      className="text-[10px] font-sans mt-0.5"
                      style={{ color: HQ_TEXT.helper }}
                    >
                      by {event.actor.slice(0, 8)}…
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
