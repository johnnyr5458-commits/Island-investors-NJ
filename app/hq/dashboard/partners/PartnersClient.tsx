"use client";

import { useState, useTransition } from "react";
import type { Profile, UserStatus } from "@/lib/supabase/types";
import { invitePartner, updatePartnerStatus } from "./actions";

const STATUS_STYLES: Record<UserStatus, { bg: string; color: string; label: string }> = {
  active: { bg: "rgba(52,211,153,0.10)", color: "#34d399", label: "Active" },
  pending: { bg: "rgba(251,191,36,0.10)", color: "#fbbf24", label: "Pending" },
  paused: { bg: "rgba(148,163,184,0.10)", color: "#94a3b8", label: "Paused" },
  removed: { bg: "rgba(248,113,113,0.10)", color: "#f87171", label: "Removed" },
};

function StatusBadge({ status }: { status: UserStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    startTransition(async () => {
      try {
        await invitePartner(new FormData(form));
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to invite partner");
      }
    });
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
  };
  const labelClass = "block font-sans text-[10px] font-semibold uppercase tracking-widest text-silver-600 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg relative" style={{ background: "#071222", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.55) 50%, transparent)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Invite Partner</h2>
              <p className="font-sans text-xs text-silver-600 mt-0.5">They will receive an email invitation to set their password.</p>
            </div>
            <button onClick={onClose} className="text-silver-700 hover:text-silver-400 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input name="name" required placeholder="Jane Smith" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input name="email" type="email" required placeholder="jane@example.com" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input name="phone" type="tel" placeholder="(609) 000-0000" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <input name="company" placeholder="Optional" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Buying Areas</label>
                <input name="buying_areas" placeholder="e.g. Atlantic County" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Budget Range</label>
                <input name="budget" placeholder="e.g. $100k–$300k" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Property Types</label>
              <input name="property_types" placeholder="e.g. Single-family, multi-unit" className="w-full px-3 py-2.5 text-sm font-sans outline-none" style={inputStyle} />
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea name="notes" rows={3} placeholder="Internal notes about this partner..." className="w-full px-3 py-2.5 text-sm font-sans outline-none resize-none" style={inputStyle} />
            </div>

            {error && <p className="font-sans text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 font-sans text-sm text-silver-500 hover:text-silver-300 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-2.5 font-sans text-sm font-bold uppercase tracking-wider transition-all"
                style={{ background: "rgba(200,150,42,0.18)", border: "1px solid rgba(200,150,42,0.40)", color: "rgba(200,150,42,0.95)" }}
              >
                {pending ? "Sending Invite..." : "Send Invitation →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PartnersClient({ partners }: { partners: Profile[] }) {
  const [showInvite, setShowInvite] = useState(false);
  const [pending, startTransition] = useTransition();

  function changeStatus(id: string, status: UserStatus) {
    startTransition(async () => {
      await updatePartnerStatus(id, status);
    });
  }

  return (
    <>
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs text-silver-600">{partners.length} partner{partners.length !== 1 ? "s" : ""} in system</p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider transition-all"
            style={{ background: "rgba(200,150,42,0.15)", border: "1px solid rgba(200,150,42,0.35)", color: "rgba(200,150,42,0.90)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Invite Partner
          </button>
        </div>

        {/* Table */}
        {partners.length === 0 ? (
          <div
            className="py-16 text-center"
            style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="font-sans text-sm text-silver-600 mb-1">No partners yet</p>
            <p className="font-sans text-xs text-silver-700">Use "Invite Partner" to onboard your first investor.</p>
          </div>
        ) : (
          <div style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Table header */}
            <div
              className="grid gap-4 px-5 py-3 font-sans text-[10px] font-bold uppercase tracking-wider text-silver-700"
              style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <span>Name / Company</span>
              <span>Contact</span>
              <span>Areas</span>
              <span>Budget</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {partners.map((p) => (
              <div
                key={p.id}
                className="grid gap-4 px-5 py-4 items-center border-b last:border-0"
                style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 1fr 1fr", borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div>
                  <div className="font-sans text-sm text-silver-200 font-medium truncate">{p.name ?? "—"}</div>
                  {p.company && <div className="font-sans text-[11px] text-silver-600 truncate mt-0.5">{p.company}</div>}
                </div>
                <div>
                  <div className="font-sans text-xs text-silver-400 truncate">{p.email}</div>
                  {p.phone && <div className="font-sans text-[11px] text-silver-600 mt-0.5">{p.phone}</div>}
                </div>
                <div className="font-sans text-xs text-silver-500 truncate">{p.buying_areas ?? "—"}</div>
                <div className="font-sans text-xs text-silver-500">{p.budget ?? "—"}</div>
                <div><StatusBadge status={p.status} /></div>
                <div className="flex items-center gap-2">
                  {p.status !== "active" && (
                    <button
                      onClick={() => changeStatus(p.id, "active")}
                      className="font-sans text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Activate"
                    >
                      Activate
                    </button>
                  )}
                  {p.status === "active" && (
                    <button
                      onClick={() => changeStatus(p.id, "paused")}
                      className="font-sans text-[10px] text-silver-500 hover:text-silver-300 transition-colors"
                      title="Pause"
                    >
                      Pause
                    </button>
                  )}
                  {p.status !== "removed" && (
                    <button
                      onClick={() => changeStatus(p.id, "removed")}
                      className="font-sans text-[10px] text-red-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite note */}
        <p className="font-sans text-[11px] text-silver-700 text-center">
          Partners are invited by email only — no public signup exists.
          They receive a magic link to set their password and access their portal.
        </p>
      </div>
    </>
  );
}
