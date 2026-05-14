import { createAdminClient } from "@/lib/supabase/server";
import { existsSync } from "fs";
import { join } from "path";
import type {
  AuditIssue,
  AuditIssueType,
  AuditIssueSeverity,
  AuditHealthSummary,
  AuditReport,
} from "@/lib/supabase/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function issueId(...parts: string[]): string {
  return parts
    .map(p => p.replace(/[^a-zA-Z0-9_-]/g, "_"))
    .join("::")
    .slice(0, 80);
}

function makeIssue(
  type: AuditIssueType,
  severity: AuditIssueSeverity,
  fields: Partial<Omit<AuditIssue, "id" | "type" | "severity">> & {
    explanation: string;
    recommended_action: string;
  }
): AuditIssue {
  return {
    id: issueId(type, fields.entity_type ?? "", fields.entity_id ?? "", fields.event_id ?? ""),
    type,
    severity,
    is_safe_to_repair: false,
    source_refs: [],
    ...fields,
  };
}

// ── Integrity Checks ──────────────────────────────────────────────────────────

// Events with entity_type set but entity_id null (or vice versa).
async function checkIncompleteEntityRefs(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cadence_events")
      .select("id, entity_type, entity_id, summary")
      .or("and(entity_type.not.is.null,entity_id.is.null),and(entity_type.is.null,entity_id.not.is.null)");

    return (data ?? []).map(row =>
      makeIssue("incomplete_entity_reference", "critical", {
        event_id: row.id,
        entity_type: row.entity_type ?? undefined,
        entity_id: row.entity_id ?? undefined,
        explanation: `Event has entity_type="${row.entity_type ?? "null"}" but entity_id="${row.entity_id ?? "null"}". Incomplete reference breaks timeline and retrieval.`,
        recommended_action: "Review this event and supply the missing entity_type or entity_id.",
        source_refs: [row.id],
      })
    );
  } catch (err) {
    console.error("[cadence-audit] checkIncompleteEntityRefs:", err);
    return [];
  }
}

// Context records that reference an entity_id not present in any event.
async function checkContextChainGaps(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();

    const [eventsResult, contextsResult] = await Promise.all([
      admin.from("cadence_events").select("entity_type, entity_id").not("entity_type", "is", null).not("entity_id", "is", null),
      admin.from("cadence_contexts").select("id, entity_type_a, entity_id_a, entity_type_b, entity_id_b"),
    ]);

    const knownEntities = new Set<string>();
    for (const row of (eventsResult.data ?? [])) {
      knownEntities.add(`${row.entity_type}::${row.entity_id}`);
    }

    const issues: AuditIssue[] = [];
    const seen = new Set<string>();

    for (const ctx of (contextsResult.data ?? [])) {
      const keyA = `${ctx.entity_type_a}::${ctx.entity_id_a}`;
      if (!knownEntities.has(keyA) && !seen.has(keyA)) {
        seen.add(keyA);
        issues.push(makeIssue("context_chain_gap", "critical", {
          entity_type: ctx.entity_type_a,
          entity_id: ctx.entity_id_a,
          context_id: ctx.id,
          explanation: `Relationship context references ${ctx.entity_type_a}/${ctx.entity_id_a} but no events have been recorded for this entity.`,
          recommended_action: "Verify this entity exists and that events are being captured for it, or remove the orphaned context record.",
          source_refs: [ctx.id],
        }));
      }

      const keyB = `${ctx.entity_type_b}::${ctx.entity_id_b}`;
      if (!knownEntities.has(keyB) && !seen.has(keyB)) {
        seen.add(keyB);
        issues.push(makeIssue("context_chain_gap", "critical", {
          entity_type: ctx.entity_type_b,
          entity_id: ctx.entity_id_b,
          context_id: ctx.id,
          explanation: `Relationship context references ${ctx.entity_type_b}/${ctx.entity_id_b} but no events have been recorded for this entity.`,
          recommended_action: "Verify this entity exists and that events are being captured for it, or remove the orphaned context record.",
          source_refs: [ctx.id],
        }));
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkContextChainGaps:", err);
    return [];
  }
}

// Entities with events but no corresponding relationship context.
async function checkOrphanedEvents(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();

    const [eventsResult, ctxAResult, ctxBResult] = await Promise.all([
      admin.from("cadence_events").select("entity_type, entity_id").not("entity_type", "is", null).not("entity_id", "is", null),
      admin.from("cadence_contexts").select("entity_type_a, entity_id_a"),
      admin.from("cadence_contexts").select("entity_type_b, entity_id_b"),
    ]);

    const contextEntities = new Set<string>();
    for (const row of (ctxAResult.data ?? [])) {
      contextEntities.add(`${row.entity_type_a}::${row.entity_id_a}`);
    }
    for (const row of (ctxBResult.data ?? [])) {
      contextEntities.add(`${row.entity_type_b}::${row.entity_id_b}`);
    }

    const seen = new Set<string>();
    const issues: AuditIssue[] = [];

    for (const row of (eventsResult.data ?? [])) {
      const key = `${row.entity_type}::${row.entity_id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      if (!contextEntities.has(key)) {
        issues.push(makeIssue("orphaned_event", "warning", {
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          explanation: `Entity ${row.entity_type}/${row.entity_id} has events recorded but no relationship contexts. Its connections to other entities are not mapped.`,
          recommended_action: "Log a context relationship for this entity to connect it to related entities (e.g., authored_by, related_to).",
          source_refs: [],
        }));
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkOrphanedEvents:", err);
    return [];
  }
}

// Entities with at least one high-priority event but no activity in 14+ days.
async function checkStaleEntities(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();
    const threshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data } = await admin
      .from("cadence_events")
      .select("entity_type, entity_id, timestamp, importance")
      .not("entity_type", "is", null)
      .not("entity_id", "is", null);

    // Group by entity, find max timestamp and whether any event is high
    const entityMap = new Map<string, { entity_type: string; entity_id: string; lastEvent: string; hasHigh: boolean }>();

    for (const row of (data ?? [])) {
      const key = `${row.entity_type}::${row.entity_id}`;
      const existing = entityMap.get(key);
      if (!existing || row.timestamp > existing.lastEvent) {
        entityMap.set(key, {
          entity_type: row.entity_type!,
          entity_id: row.entity_id!,
          lastEvent: row.timestamp,
          hasHigh: (existing?.hasHigh ?? false) || row.importance === "high",
        });
      } else if (row.importance === "high") {
        existing.hasHigh = true;
      }
    }

    const issues: AuditIssue[] = [];
    for (const entity of entityMap.values()) {
      if (entity.hasHigh && entity.lastEvent < threshold) {
        const daysAgo = Math.floor((Date.now() - new Date(entity.lastEvent).getTime()) / 86400000);
        issues.push(makeIssue("stale_entity", "warning", {
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          explanation: `Entity ${entity.entity_type}/${entity.entity_id} had a high-priority event but has had no activity for ${daysAgo} days. It may be unresolved or abandoned.`,
          recommended_action: "Review this entity's status. Log a follow-up event or archive if resolved.",
          source_refs: [],
        }));
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkStaleEntities:", err);
    return [];
  }
}

// Two events with the same type and entity_id within 60 seconds.
async function checkDuplicateEventRisks(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();

    const { data } = await admin
      .from("cadence_events")
      .select("id, type, entity_type, entity_id, timestamp")
      .not("entity_type", "is", null)
      .not("entity_id", "is", null)
      .order("entity_type", { ascending: true })
      .order("entity_id", { ascending: true })
      .order("type", { ascending: true })
      .order("timestamp", { ascending: true });

    const issues: AuditIssue[] = [];
    const rows = data ?? [];

    for (let i = 0; i < rows.length - 1; i++) {
      const a = rows[i];
      const b = rows[i + 1];

      if (
        a.type === b.type &&
        a.entity_type === b.entity_type &&
        a.entity_id === b.entity_id
      ) {
        const diffSeconds = Math.abs(
          (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) / 1000
        );
        if (diffSeconds < 60) {
          issues.push(makeIssue("duplicate_event_risk", "warning", {
            entity_type: a.entity_type,
            entity_id: a.entity_id,
            event_id: a.id,
            explanation: `Two "${a.type}" events for ${a.entity_type}/${a.entity_id} were recorded ${Math.round(diffSeconds)}s apart. This may indicate double-logging.`,
            recommended_action: "Verify whether both events represent distinct actions. If duplicated, the older entry can be reviewed.",
            is_safe_to_repair: false,
            source_refs: [a.id, b.id],
          }));
        }
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkDuplicateEventRisks:", err);
    return [];
  }
}

// Entities with exactly one recorded event (may be incomplete timelines).
async function checkSingletonTimelines(): Promise<AuditIssue[]> {
  try {
    const admin = createAdminClient();

    const { data } = await admin
      .from("cadence_events")
      .select("entity_type, entity_id")
      .not("entity_type", "is", null)
      .not("entity_id", "is", null);

    const counts = new Map<string, { entity_type: string; entity_id: string; count: number }>();
    for (const row of (data ?? [])) {
      const key = `${row.entity_type}::${row.entity_id}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { entity_type: row.entity_type!, entity_id: row.entity_id!, count: 1 });
      }
    }

    const issues: AuditIssue[] = [];
    for (const entity of counts.values()) {
      if (entity.count === 1) {
        issues.push(makeIssue("singleton_timeline", "info", {
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          explanation: `Entity ${entity.entity_type}/${entity.entity_id} has only 1 recorded event. The timeline may be incomplete.`,
          recommended_action: "This is normal for newly captured entities. Monitor whether additional events are logged over time.",
          is_safe_to_repair: false,
          source_refs: [],
        }));
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkSingletonTimelines:", err);
    return [];
  }
}

// Entities in events that have no corresponding Obsidian vault note.
async function checkMissingVaultNotes(): Promise<AuditIssue[]> {
  const vaultPath = process.env.CADENCE_VAULT_PATH;
  if (!vaultPath) return [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cadence_events")
      .select("entity_type, entity_id")
      .not("entity_type", "is", null)
      .not("entity_id", "is", null);

    const seen = new Set<string>();
    const issues: AuditIssue[] = [];

    for (const row of (data ?? [])) {
      const key = `${row.entity_type}::${row.entity_id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const notePath = join(vaultPath, "Cadence", "Entities", row.entity_type!, `${row.entity_id}.md`);
      if (!existsSync(notePath)) {
        issues.push(makeIssue("missing_vault_note", "info", {
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          explanation: `Entity ${row.entity_type}/${row.entity_id} has operational events but no synced vault note exists at ${notePath}.`,
          recommended_action: "Run the vault sync script (npm run sync:vault) to generate this entity note.",
          source_refs: [],
        }));
      }
    }

    return issues;
  } catch (err) {
    console.error("[cadence-audit] checkMissingVaultNotes:", err);
    return [];
  }
}

// ── Health Score ──────────────────────────────────────────────────────────────

function calculateHealthScore(issues: AuditIssue[]): number {
  const critical = issues.filter(i => i.severity === "critical").length;
  const warning  = issues.filter(i => i.severity === "warning").length;
  const info     = issues.filter(i => i.severity === "info").length;
  const penalty  = critical * 10 + warning * 3 + info * 1;
  return Math.max(0, Math.min(100, 100 - penalty));
}

// ── Main Audit Runner ─────────────────────────────────────────────────────────

export async function runAudit(
  triggeredBy: "manual" | "scheduled" | "system" = "manual"
): Promise<AuditReport> {
  const startMs = Date.now();
  const id = crypto.randomUUID();
  const ranAt = new Date().toISOString();

  try {
    const admin = createAdminClient();

    // Run all checks in parallel; each is self-contained and catches its own errors
    const [
      incompleteRefs,
      contextGaps,
      orphanedEvents,
      staleEntities,
      duplicateRisks,
      singletonTimelines,
      missingVaultNotes,
      eventCountResult,
      contextCountResult,
    ] = await Promise.all([
      checkIncompleteEntityRefs(),
      checkContextChainGaps(),
      checkOrphanedEvents(),
      checkStaleEntities(),
      checkDuplicateEventRisks(),
      checkSingletonTimelines(),
      checkMissingVaultNotes(),
      admin.from("cadence_events").select("id", { count: "exact", head: true }),
      admin.from("cadence_contexts").select("id", { count: "exact", head: true }),
    ]);

    const issues: AuditIssue[] = [
      ...incompleteRefs,
      ...contextGaps,
      ...orphanedEvents,
      ...staleEntities,
      ...duplicateRisks,
      ...singletonTimelines,
      ...missingVaultNotes,
    ];

    // Count distinct entities seen across events
    const { data: entityRows } = await admin
      .from("cadence_events")
      .select("entity_type, entity_id")
      .not("entity_type", "is", null)
      .not("entity_id", "is", null);

    const distinctEntities = new Set<string>();
    for (const row of (entityRows ?? [])) {
      distinctEntities.add(`${row.entity_type}::${row.entity_id}`);
    }

    const healthScore = calculateHealthScore(issues);

    const summary: AuditHealthSummary = {
      total_events:          eventCountResult.count ?? 0,
      total_contexts:        contextCountResult.count ?? 0,
      total_entities:        distinctEntities.size,
      incomplete_refs:       incompleteRefs.length,
      context_chain_gaps:    contextGaps.length,
      orphaned_events:       orphanedEvents.length,
      stale_entities:        staleEntities.length,
      duplicate_event_risks: duplicateRisks.length,
      singleton_timelines:   singletonTimelines.length,
      missing_vault_notes:   missingVaultNotes.length,
      health_score:          healthScore,
    };

    return {
      id,
      ran_at: ranAt,
      triggered_by: triggeredBy,
      duration_ms: Date.now() - startMs,
      issues,
      summary,
    };
  } catch (err) {
    console.error("[cadence-audit] runAudit fatal:", err);
    return {
      id,
      ran_at: ranAt,
      triggered_by: triggeredBy,
      duration_ms: Date.now() - startMs,
      issues: [],
      summary: {
        total_events: 0, total_contexts: 0, total_entities: 0,
        incomplete_refs: 0, context_chain_gaps: 0, orphaned_events: 0,
        stale_entities: 0, duplicate_event_risks: 0, singleton_timelines: 0,
        missing_vault_notes: 0, health_score: 100,
      },
    };
  }
}
