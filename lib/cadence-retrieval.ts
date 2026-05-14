import { createAdminClient } from "@/lib/supabase/server";
import { readEntityVaultNote } from "@/lib/cadence-vault";
import type {
  CadenceEvent,
  CadenceContext,
  RetrievalQueryType,
  TraceableEvent,
  TraceableRelationship,
  RetrievalResponse,
} from "@/lib/supabase/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function stamp(event: CadenceEvent, retrievedAt: string): TraceableEvent {
  return { ...event, _source: "cadence_events", _retrieved_at: retrievedAt };
}

function stampRel(ctx: CadenceContext, retrievedAt: string): TraceableRelationship {
  return { ...ctx, _source: "cadence_contexts", _retrieved_at: retrievedAt };
}

function emptyResponse(type: RetrievalQueryType, note?: string): RetrievalResponse {
  return {
    query_type: type,
    events: [],
    relationships: [],
    total_found: 0,
    completeness: "no_data",
    uncertainty_note: note,
    retrieved_at: now(),
  };
}

// Deduplicates relationship records by id.
function dedupeRelationships(rows: CadenceContext[]): CadenceContext[] {
  const seen = new Set<string>();
  return rows.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── Retrieval Functions ───────────────────────────────────────────────────────

// All events + relationships + optional vault note for a single entity.
export async function retrieveEntityMemory(
  entityType: string,
  entityId: string
): Promise<RetrievalResponse> {
  const retrievedAt = now();
  try {
    const admin = createAdminClient();

    const [eventsResult, relsAResult, relsBResult] = await Promise.all([
      admin
        .from("cadence_events")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("timestamp", { ascending: false })
        .limit(200),
      admin
        .from("cadence_contexts")
        .select("*")
        .eq("entity_type_a", entityType)
        .eq("entity_id_a", entityId),
      admin
        .from("cadence_contexts")
        .select("*")
        .eq("entity_type_b", entityType)
        .eq("entity_id_b", entityId),
    ]);

    const events = (eventsResult.data ?? []) as CadenceEvent[];
    const relationships = dedupeRelationships([
      ...((relsAResult.data ?? []) as CadenceContext[]),
      ...((relsBResult.data ?? []) as CadenceContext[]),
    ]);

    const vaultNote = await readEntityVaultNote(entityType, entityId);

    const completeness =
      events.length === 0 && relationships.length === 0 ? "no_data" : "full";

    return {
      query_type: "entity_memory",
      events: events.map(e => stamp(e, retrievedAt)),
      relationships: relationships.map(r => stampRel(r, retrievedAt)),
      vault_note: vaultNote ?? undefined,
      total_found: events.length,
      completeness,
      uncertainty_note:
        completeness === "no_data"
          ? `No operational memory found for ${entityType} / ${entityId}.`
          : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveEntityMemory:", err);
    return emptyResponse("entity_memory", "Retrieval error. Data may be incomplete.");
  }
}

// Full-text search across event summaries, types, sources, and actors.
export async function retrieveTextSearch(
  query: string,
  limit = 50
): Promise<RetrievalResponse> {
  const retrievedAt = now();
  if (!query.trim()) {
    return emptyResponse("text_search", "Search query was empty.");
  }
  try {
    const admin = createAdminClient();

    // Sanitize for tsquery: replace whitespace runs with ' & ' (AND semantics)
    const tsQuery = query.trim().replace(/\s+/g, " & ");

    const { data } = await admin
      .from("cadence_events")
      .select("*")
      .textSearch("search_vector", tsQuery, { type: "plain", config: "english" })
      .order("timestamp", { ascending: false })
      .limit(limit);

    const events = (data ?? []) as CadenceEvent[];
    return {
      query_type: "text_search",
      events: events.map(e => stamp(e, retrievedAt)),
      relationships: [],
      total_found: events.length,
      completeness: events.length > 0 ? "full" : "no_data",
      uncertainty_note:
        events.length === 0
          ? `No events matched "${query}". Try different terms.`
          : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveTextSearch:", err);
    return emptyResponse("text_search", "Search encountered an error.");
  }
}

// Events within an explicit date range.
export async function retrieveTimelineRange(
  from: string,
  to: string,
  filters?: { source?: string; importance?: "normal" | "high" },
  limit = 100
): Promise<RetrievalResponse> {
  const retrievedAt = now();
  try {
    const admin = createAdminClient();

    let query = admin
      .from("cadence_events")
      .select("*")
      .gte("timestamp", from)
      .lte("timestamp", to)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (filters?.source) query = query.eq("source", filters.source);
    if (filters?.importance) query = query.eq("importance", filters.importance);

    const { data } = await query;
    const events = (data ?? []) as CadenceEvent[];

    return {
      query_type: "timeline_range",
      events: events.map(e => stamp(e, retrievedAt)),
      relationships: [],
      total_found: events.length,
      completeness: events.length > 0 ? "full" : "no_data",
      uncertainty_note:
        events.length === 0
          ? "No events recorded during this time range."
          : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveTimelineRange:", err);
    return emptyResponse("timeline_range", "Range retrieval encountered an error.");
  }
}

// Recursive relationship graph traversal from a root entity.
export async function retrieveRelationshipGraph(
  entityType: string,
  entityId: string,
  depth = 2
): Promise<RetrievalResponse> {
  const retrievedAt = now();
  try {
    const admin = createAdminClient();

    const { data } = await admin.rpc("get_cadence_entity_graph", {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_max_depth: Math.min(depth, 3),
    });

    // RPC returns rows matching the TABLE() return type — map to CadenceContext shape
    type GraphRow = {
      entity_type_a: string;
      entity_id_a: string;
      relationship: string;
      entity_type_b: string;
      entity_id_b: string;
      depth: number;
    };
    const rows = (data ?? []) as GraphRow[];

    const relationships: TraceableRelationship[] = rows.map(r => ({
      id: `${r.entity_id_a}:${r.relationship}:${r.entity_id_b}`,
      entity_type_a: r.entity_type_a,
      entity_id_a: r.entity_id_a,
      relationship: r.relationship,
      entity_type_b: r.entity_type_b,
      entity_id_b: r.entity_id_b,
      metadata: { depth: r.depth },
      created_at: retrievedAt,
      _source: "cadence_contexts",
      _retrieved_at: retrievedAt,
    }));

    return {
      query_type: "relationship_graph",
      events: [],
      relationships,
      total_found: relationships.length,
      completeness: relationships.length > 0 ? "full" : "no_data",
      uncertainty_note:
        relationships.length === 0
          ? `No relationship graph found for ${entityType} / ${entityId}.`
          : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveRelationshipGraph:", err);
    return emptyResponse("relationship_graph", "Graph traversal encountered an error.");
  }
}

// Events from the last N hours.
export async function retrieveRecentActivity(
  hours: number,
  limit = 100
): Promise<RetrievalResponse> {
  const retrievedAt = now();
  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data } = await admin
      .from("cadence_events")
      .select("*")
      .gte("timestamp", since)
      .order("timestamp", { ascending: false })
      .limit(limit);

    const events = (data ?? []) as CadenceEvent[];
    return {
      query_type: "recent_activity",
      events: events.map(e => stamp(e, retrievedAt)),
      relationships: [],
      total_found: events.length,
      completeness: events.length > 0 ? "full" : "no_data",
      uncertainty_note:
        events.length === 0
          ? `No operational activity recorded in the last ${hours} hours.`
          : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveRecentActivity:", err);
    return emptyResponse("recent_activity", "Recent activity retrieval encountered an error.");
  }
}

// High-importance events only.
export async function retrieveHighPriority(limit = 50): Promise<RetrievalResponse> {
  const retrievedAt = now();
  try {
    const admin = createAdminClient();

    const { data } = await admin
      .from("cadence_events")
      .select("*")
      .eq("importance", "high")
      .order("timestamp", { ascending: false })
      .limit(limit);

    const events = (data ?? []) as CadenceEvent[];
    return {
      query_type: "high_priority",
      events: events.map(e => stamp(e, retrievedAt)),
      relationships: [],
      total_found: events.length,
      completeness: events.length > 0 ? "full" : "no_data",
      uncertainty_note:
        events.length === 0 ? "No high-priority events recorded." : undefined,
      retrieved_at: retrievedAt,
    };
  } catch (err) {
    console.error("[cadence-retrieval] retrieveHighPriority:", err);
    return emptyResponse("high_priority", "High-priority retrieval encountered an error.");
  }
}
