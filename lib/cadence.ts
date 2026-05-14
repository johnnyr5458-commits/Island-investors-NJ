import { createAdminClient } from "@/lib/supabase/server";

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
