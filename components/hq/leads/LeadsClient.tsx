"use client";

import { useState, useTransition } from "react";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import { updateLeadStatus } from "@/app/hq/dashboard/leads/actions";
import type { ContactSubmission, LeadStatus } from "@/lib/supabase/types";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LeadStatus, { bg: string; color: string; label: string }> = {
  new:       { bg: "rgba(251,191,36,0.10)",  color: "#fbbf24", label: "New"       },
  contacted: { bg: "rgba(96,165,250,0.10)",  color: "#60a5fa", label: "Contacted" },
  qualified: { bg: "rgba(52,211,153,0.10)",  color: "#34d399", label: "Qualified" },
  closed:    { bg: "rgba(200,150,42,0.12)",  color: HQ_GOLD.text, label: "Closed" },
  archived:  { bg: "rgba(148,163,184,0.10)", color: "#94a3b8", label: "Archived"  },
};

function StatusBadge({ status }: { status: LeadStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  return (
    <span
      className="inline-block font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function LeadModal({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: ContactSubmission;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden"
        style={{ background: "#071222", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Gold top edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.65) 40%, rgba(200,150,42,0.65) 60%, transparent)" }}
        />

        <div className="px-7 pt-8 pb-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span
                className="font-sans text-[9px] font-bold uppercase tracking-[0.22em] px-2 py-1 mb-3 inline-block"
                style={{ background: "rgba(200,150,42,0.08)", border: "1px solid rgba(200,150,42,0.20)", color: HQ_GOLD.dim }}
              >
                Seller Lead
              </span>
              <h2 className="font-display text-xl font-bold text-white leading-tight">{lead.name}</h2>
              <p className="font-sans text-xs mt-1" style={{ color: HQ_TEXT.muted }}>{lead.address}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 shrink-0 font-sans text-xs transition-colors duration-150"
              style={{ color: HQ_TEXT.helper }}
            >
              ✕
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3 mb-6">
            {[
              { label: "Phone",     value: lead.phone },
              { label: "Email",     value: lead.email ?? "—" },
              { label: "Best Time", value: lead.best_time ?? "Not specified" },
              { label: "Source",    value: lead.lead_source },
              { label: "Received",  value: new Date(lead.created_at).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <span
                  className="font-sans text-[10px] font-semibold uppercase tracking-wider w-24 shrink-0 pt-0.5"
                  style={{ color: HQ_TEXT.helper }}
                >
                  {label}
                </span>
                <span className="font-sans text-xs leading-relaxed" style={{ color: HQ_TEXT.secondary }}>{value}</span>
              </div>
            ))}

            {lead.message && (
              <div className="flex gap-4">
                <span
                  className="font-sans text-[10px] font-semibold uppercase tracking-wider w-24 shrink-0 pt-0.5"
                  style={{ color: HQ_TEXT.helper }}
                >
                  Situation
                </span>
                <span className="font-sans text-xs leading-relaxed" style={{ color: HQ_TEXT.secondary }}>
                  {lead.message}
                </span>
              </div>
            )}
          </div>

          <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* Status actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-wider mr-1" style={{ color: HQ_TEXT.helper }}>
              Set status:
            </span>
            {(Object.keys(STATUS_STYLES) as LeadStatus[]).map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(lead.id, s)}
                className="font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-1 transition-all duration-150"
                style={{
                  background: lead.status === s ? STATUS_STYLES[s].bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${lead.status === s ? STATUS_STYLES[s].color + "50" : "rgba(255,255,255,0.08)"}`,
                  color: lead.status === s ? STATUS_STYLES[s].color : HQ_TEXT.muted,
                }}
              >
                {STATUS_STYLES[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LeadsClient({ leads: initial }: { leads: ContactSubmission[] }) {
  const [leads, setLeads] = useState(initial);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [, startTransition] = useTransition();

  function handleStatusChange(id: string, status: LeadStatus) {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);

    startTransition(async () => {
      await updateLeadStatus(id, status);
    });
  }

  if (leads.length === 0) {
    return (
      <div
        className="p-12 text-center"
        style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(200,150,42,0.06)", border: "1px solid rgba(200,150,42,0.12)" }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: HQ_GOLD.dim }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="font-sans text-sm font-semibold text-white mb-1">No leads yet</p>
        <p className="font-sans text-xs leading-relaxed" style={{ color: HQ_TEXT.muted }}>
          Seller leads will appear here once the Formspree webhook is configured and receives its first submission.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div
        className="overflow-hidden"
        style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Column headers */}
        <div
          className="hidden md:grid px-5 py-3 gap-4 text-[9px] font-bold uppercase tracking-wider"
          style={{
            gridTemplateColumns: "2fr 2.5fr 1fr 1.5fr 1fr",
            color: HQ_TEXT.helper,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <span>Name / Phone</span>
          <span>Address</span>
          <span>Best Time</span>
          <span>Status</span>
          <span>Received</span>
        </div>

        {/* Rows */}
        <div>
          {leads.map((lead, i) => (
            <div
              key={lead.id}
              className="grid px-5 py-4 gap-4 cursor-pointer transition-all duration-150 group"
              style={{
                gridTemplateColumns: "2fr 2.5fr 1fr 1.5fr 1fr",
                borderBottom: i < leads.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
              }}
              onClick={() => setSelected(lead)}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name + Phone */}
              <div className="min-w-0">
                <p className="font-sans text-xs font-semibold truncate" style={{ color: HQ_TEXT.secondary }}>
                  {lead.name}
                </p>
                <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: HQ_TEXT.helper }}>
                  {lead.phone}
                </p>
              </div>

              {/* Address */}
              <div className="min-w-0 hidden md:block">
                <p className="font-sans text-xs truncate" style={{ color: HQ_TEXT.muted }}>{lead.address}</p>
                {lead.message && (
                  <p className="font-sans text-[10px] mt-0.5 truncate" style={{ color: HQ_TEXT.helper }}>
                    {lead.message}
                  </p>
                )}
              </div>

              {/* Best time */}
              <div className="hidden md:flex items-start">
                <span className="font-sans text-[10px] capitalize" style={{ color: HQ_TEXT.muted }}>
                  {lead.best_time ?? "—"}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-start">
                <StatusBadge status={lead.status} />
              </div>

              {/* Date */}
              <div className="hidden md:flex items-start">
                <span className="font-sans text-[10px]" style={{ color: HQ_TEXT.helper }}>
                  {new Date(lead.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <LeadModal
          lead={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
