"use client";

import { useState, useCallback } from "react";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";
import { EventResult, RelationshipResult } from "@/components/hq/cadence/RetrievalResult";
import type {
  RetrievalQueryType,
  RetrievalResponse,
  TraceableEvent,
  TraceableRelationship,
} from "@/lib/supabase/types";

// ── Query Type Definitions ────────────────────────────────────────────────────

const QUERY_TYPES: { id: RetrievalQueryType; label: string }[] = [
  { id: "recent_activity",    label: "Recent Activity" },
  { id: "high_priority",      label: "High Priority" },
  { id: "text_search",        label: "Search" },
  { id: "entity_memory",      label: "Entity Memory" },
  { id: "timeline_range",     label: "Date Range" },
  { id: "relationship_graph", label: "Relationship Graph" },
];

const HOURS_OPTIONS = [
  { value: 24,  label: "Last 24 hours" },
  { value: 48,  label: "Last 48 hours" },
  { value: 168, label: "Last 7 days" },
  { value: 720, label: "Last 30 days" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-sans font-semibold uppercase tracking-widest" style={{ color: HQ_TEXT.muted }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-sm border px-3 py-2 text-[13px] font-sans bg-transparent outline-none focus:ring-1"
        style={{
          borderColor: "rgba(255,255,255,0.10)",
          color: HQ_TEXT.secondary,
          caretColor: HQ_GOLD.bright,
        }}
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-sans font-semibold uppercase tracking-widest" style={{ color: HQ_TEXT.muted }}>
        {label}
      </label>
      <select
        value={String(value)}
        onChange={e => onChange(e.target.value)}
        className="rounded-sm border px-3 py-2 text-[13px] font-sans bg-transparent outline-none"
        style={{
          borderColor: "rgba(255,255,255,0.10)",
          color: HQ_TEXT.secondary,
          background: "rgba(0,0,0,0.3)",
        }}
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)} style={{ background: "#0f1a2a" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface RetrievalInterfaceProps {
  initialData?: RetrievalResponse;
}

export default function RetrievalInterface({ initialData }: RetrievalInterfaceProps) {
  const [activeType, setActiveType] = useState<RetrievalQueryType>("recent_activity");
  const [hours, setHours] = useState("24");
  const [textQuery, setTextQuery] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [depth, setDepth] = useState("2");

  const [result, setResult] = useState<RetrievalResponse | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  const handleRetrieve = useCallback(async () => {
    setLoading(true);
    setTraceOpen(false);

    const body: Record<string, unknown> = { type: activeType };

    if (activeType === "recent_activity")    body.hours = Number(hours);
    if (activeType === "text_search")        body.text_query = textQuery;
    if (activeType === "entity_memory")      { body.entity_type = entityType; body.entity_id = entityId; }
    if (activeType === "relationship_graph") { body.entity_type = entityType; body.entity_id = entityId; body.depth = Number(depth); }
    if (activeType === "timeline_range")     { body.date_from = dateFrom ? new Date(dateFrom).toISOString() : ""; body.date_to = dateTo ? new Date(dateTo + "T23:59:59").toISOString() : ""; }

    try {
      const res = await fetch("/api/hq/cadence/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as RetrievalResponse;
      setResult(data);
    } catch {
      setResult({
        query_type: activeType,
        events: [],
        relationships: [],
        total_found: 0,
        completeness: "no_data",
        uncertainty_note: "Network error. Unable to reach retrieval service.",
        retrieved_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [activeType, hours, textQuery, entityType, entityId, dateFrom, dateTo, depth]);

  const allEvents: TraceableEvent[] = result?.events ?? [];
  const allRels: TraceableRelationship[] = result?.relationships ?? [];
  const hasResults = allEvents.length > 0 || allRels.length > 0;

  return (
    <div className="space-y-5">

      {/* Query type tabs */}
      <div
        className="rounded-sm border overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex flex-wrap border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {QUERY_TYPES.map(qt => {
            const active = activeType === qt.id;
            return (
              <button
                key={qt.id}
                onClick={() => { setActiveType(qt.id); setResult(undefined); }}
                className="px-4 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-wider transition-colors"
                style={{
                  color: active ? HQ_GOLD.bright : HQ_TEXT.helper,
                  background: active ? "rgba(200,150,42,0.08)" : "transparent",
                  borderBottom: active ? `2px solid ${HQ_GOLD.bright}` : "2px solid transparent",
                }}
              >
                {qt.label}
              </button>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="px-4 py-4 flex flex-wrap items-end gap-3">
          {activeType === "recent_activity" && (
            <SelectField
              label="Time Window"
              value={hours}
              onChange={setHours}
              options={HOURS_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />
          )}

          {activeType === "text_search" && (
            <div className="flex-1 min-w-[200px]">
              <InputField
                label="Search Terms"
                value={textQuery}
                onChange={setTextQuery}
                placeholder="e.g. lead blog published"
              />
            </div>
          )}

          {(activeType === "entity_memory" || activeType === "relationship_graph") && (
            <>
              <InputField
                label="Entity Type"
                value={entityType}
                onChange={setEntityType}
                placeholder="e.g. blog_post"
              />
              <div className="flex-1 min-w-[160px]">
                <InputField
                  label="Entity ID"
                  value={entityId}
                  onChange={setEntityId}
                  placeholder="e.g. my-post-slug"
                />
              </div>
              {activeType === "relationship_graph" && (
                <SelectField
                  label="Depth"
                  value={depth}
                  onChange={setDepth}
                  options={[
                    { value: 1, label: "1 hop" },
                    { value: 2, label: "2 hops" },
                    { value: 3, label: "3 hops" },
                  ]}
                />
              )}
            </>
          )}

          {activeType === "timeline_range" && (
            <>
              <InputField label="From" value={dateFrom} onChange={setDateFrom} type="date" />
              <InputField label="To"   value={dateTo}   onChange={setDateTo}   type="date" />
            </>
          )}

          {activeType === "high_priority" && (
            <p className="text-[12px] font-sans" style={{ color: HQ_TEXT.helper }}>
              Retrieves all high-importance events in reverse chronological order.
            </p>
          )}

          {/* Retrieve button */}
          <button
            onClick={handleRetrieve}
            disabled={loading}
            className="ml-auto px-5 py-2 rounded-sm text-[12px] font-sans font-semibold uppercase tracking-wider transition-opacity"
            style={{
              background: loading ? "rgba(200,150,42,0.20)" : "rgba(200,150,42,0.18)",
              color: loading ? HQ_GOLD.dim : HQ_GOLD.bright,
              border: `1px solid ${HQ_GOLD.border}`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Retrieving…" : "Retrieve"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div
          className="rounded-sm border overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          {/* Result header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-sans font-semibold uppercase tracking-widest"
                style={{ color: HQ_TEXT.muted }}
              >
                {result.total_found} event{result.total_found !== 1 ? "s" : ""}
                {allRels.length > 0 && ` · ${allRels.length} relationship${allRels.length !== 1 ? "s" : ""}`}
              </span>
              {result.completeness === "no_data" && (
                <span
                  className="text-[10px] font-sans px-1.5 py-0.5 rounded-sm"
                  style={{ background: "rgba(255,255,255,0.06)", color: HQ_TEXT.disabled }}
                >
                  no data
                </span>
              )}
            </div>
            <button
              onClick={() => setTraceOpen(o => !o)}
              className="text-[10px] font-sans uppercase tracking-wider"
              style={{ color: HQ_TEXT.disabled }}
            >
              {traceOpen ? "Hide Trace" : "Show Trace"}
            </button>
          </div>

          {/* Uncertainty note */}
          {result.uncertainty_note && (
            <div
              className="px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-[12px] font-sans" style={{ color: HQ_TEXT.helper }}>
                {result.uncertainty_note}
              </p>
            </div>
          )}

          {/* Vault note indicator */}
          {result.vault_note?.exists && (
            <div
              className="px-4 py-2.5 border-b flex items-center gap-2"
              style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(99,102,241,0.06)" }}
            >
              <span className="text-[10px] font-sans uppercase tracking-wider" style={{ color: "rgba(165,180,252,0.80)" }}>
                Vault note found
              </span>
              <span className="text-[10px] font-mono" style={{ color: HQ_TEXT.disabled }}>
                {result.vault_note.path.split("/").slice(-3).join("/")}
              </span>
            </div>
          )}

          {/* Event results */}
          {allEvents.length > 0 && (
            <div>
              {allEvents.map(e => (
                <EventResult key={e.id} event={e} />
              ))}
            </div>
          )}

          {/* Relationship results */}
          {allRels.length > 0 && (
            <div>
              {allRels.map(r => (
                <RelationshipResult key={r.id} rel={r} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!hasResults && !result.uncertainty_note && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-sans" style={{ color: HQ_TEXT.muted }}>
                No operational memory found matching this query.
              </p>
              <p className="text-xs font-sans mt-1" style={{ color: HQ_TEXT.helper }}>
                The system has not captured events matching these criteria.
              </p>
            </div>
          )}

          {/* Traceability panel */}
          {traceOpen && (
            <div
              className="px-4 py-3 border-t space-y-1"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
            >
              <p className="text-[10px] font-sans font-semibold uppercase tracking-widest mb-2" style={{ color: HQ_TEXT.disabled }}>
                Traceability
              </p>
              <p className="text-[11px] font-mono" style={{ color: HQ_TEXT.helper }}>
                query_type: {result.query_type}
              </p>
              <p className="text-[11px] font-mono" style={{ color: HQ_TEXT.helper }}>
                completeness: {result.completeness}
              </p>
              <p className="text-[11px] font-mono" style={{ color: HQ_TEXT.helper }}>
                retrieved_at: {new Date(result.retrieved_at).toLocaleString("en-US", { timeZone: "America/New_York" })}
              </p>
              {allEvents.length > 0 && (
                <p className="text-[11px] font-mono break-all" style={{ color: HQ_TEXT.disabled }}>
                  event_ids: [{allEvents.slice(0, 5).map(e => e.id.split("-")[0]).join(", ")}{allEvents.length > 5 ? `, +${allEvents.length - 5} more` : ""}]
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
