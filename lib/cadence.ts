import { createAdminClient } from "@/lib/supabase/server";
import type { CadenceEvent } from "@/lib/supabase/types";

// ─── Event Logging (Phase 1) ─────────────────────────────────────────────────

export interface CadenceEventInput {
  type: string;
  actor?: string;
  source: string;
  summary: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  importance?: "normal" | "high";
}

export function logEvent(input: CadenceEventInput): void {
  void (async () => {
    try {
      const admin = createAdminClient();
      await admin.from("cadence_events").insert({
        type:        input.type,
        actor:       input.actor ?? "system",
        source:      input.source,
        summary:     input.summary,
        entity_type: input.entityType ?? null,
        entity_id:   input.entityId ?? null,
        metadata:    input.metadata ?? null,
        importance:  input.importance ?? "normal",
      });
    } catch (err) {
      console.error("[cadence] logEvent failed:", err);
    }
  })();
}

// ─── Context Relationships (Phase 2) ────────────────────────────────────────

export interface CadenceContextInput {
  entityTypeA: string;
  entityIdA: string;
  relationship: string;
  entityTypeB: string;
  entityIdB: string;
  metadata?: Record<string, unknown>;
}

// Fire-and-forget, idempotent — unique index prevents duplicates
export function logContext(input: CadenceContextInput): void {
  void (async () => {
    try {
      const admin = createAdminClient();
      await admin.from("cadence_contexts").upsert({
        entity_type_a: input.entityTypeA,
        entity_id_a:   input.entityIdA,
        relationship:  input.relationship,
        entity_type_b: input.entityTypeB,
        entity_id_b:   input.entityIdB,
        metadata:      input.metadata ?? null,
      }, {
        onConflict: "entity_type_a,entity_id_a,relationship,entity_type_b,entity_id_b",
        ignoreDuplicates: true,
      });
    } catch (err) {
      console.error("[cadence] logContext failed:", err);
    }
  })();
}

// ─── Entity Timeline Query (Phase 2) ────────────────────────────────────────

// Server-only: fetch chronological event history for a single entity.
// Used by server components — not suitable for client-side use.
export async function getEntityTimeline(
  entityType: string,
  entityId: string
): Promise<CadenceEvent[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cadence_events")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("timestamp", { ascending: true });
    return (data ?? []) as CadenceEvent[];
  } catch {
    return [];
  }
}
