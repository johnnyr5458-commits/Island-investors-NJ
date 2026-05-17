import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateEntityNote, generateDailyLog } from "@/lib/cadence-vault";
import { logEvent } from "@/lib/cadence";
import type { VaultEvent, VaultContext } from "@/lib/cadence-vault";

function authorized(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  return !!secret && token === secret;
}

export async function GET(req: NextRequest) {
  const secret = process.env.ANALYTICS_CRON_SECRET ?? process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Not configured", hint: "ANALYTICS_CRON_SECRET and CRON_SECRET are both unset" },
      { status: 503 },
    );
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const generatedAt = new Date().toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString().split("T")[0];

    // ── Fetch recent events with entity references ──────────────────────────
    const { data: rawEvents, error: eventsError } = await admin
      .from("cadence_events")
      .select("*")
      .gte("timestamp", sevenDaysAgo)
      .not("entity_type", "is", null)
      .not("entity_id", "is", null)
      .order("timestamp", { ascending: true });

    if (eventsError) throw new Error(`Events query failed: ${eventsError.message}`);

    const events = (rawEvents ?? []) as VaultEvent[];

    // ── Fetch all contexts ──────────────────────────────────────────────────
    const { data: rawContexts } = await admin
      .from("cadence_contexts")
      .select("*");

    const contexts = (rawContexts ?? []) as VaultContext[];

    // ── Group events by (entity_type, entity_id) ───────────────────────────
    const entityMap = new Map<string, VaultEvent[]>();
    for (const event of events) {
      if (!event.entity_type || !event.entity_id) continue;
      const key = `${event.entity_type}::${event.entity_id}`;
      const existing = entityMap.get(key) ?? [];
      existing.push(event);
      entityMap.set(key, existing);
    }

    // ── Generate and upsert entity notes ───────────────────────────────────
    let entitiesSynced = 0;

    for (const [key, entityEvents] of entityMap.entries()) {
      const [entityType, entityId] = key.split("::");

      const entityContexts = contexts.filter(
        c => (c.entity_type_a === entityType && c.entity_id_a === entityId) ||
             (c.entity_type_b === entityType && c.entity_id_b === entityId),
      );

      const noteContent = generateEntityNote({
        entityType,
        entityId,
        events: entityEvents,
        contexts: entityContexts,
      });

      await admin.from("cadence_vault_notes").upsert(
        { entity_type: entityType, entity_id: entityId, note_content: noteContent, generated_at: generatedAt },
        { onConflict: "entity_type,entity_id" },
      );

      entitiesSynced++;
    }

    // ── Generate daily log for today ────────────────────────────────────────
    const { data: todayRaw } = await admin
      .from("cadence_events")
      .select("*")
      .gte("timestamp", `${today}T00:00:00.000Z`)
      .order("timestamp", { ascending: true });

    const todayEvents = (todayRaw ?? []) as VaultEvent[];
    const dailyContent = generateDailyLog(today, todayEvents);

    await admin.from("cadence_vault_notes").upsert(
      {
        entity_type:  "system",
        entity_id:    `daily-log-${today}`,
        note_content: dailyContent,
        generated_at: generatedAt,
      },
      { onConflict: "entity_type,entity_id" },
    );

    console.log("[cadence-sync] Sync complete — entities: %d, daily events: %d", entitiesSynced, todayEvents.length);

    return NextResponse.json({
      ok:              true,
      entities_synced: entitiesSynced,
      daily_events:    todayEvents.length,
      generated_at:    generatedAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cadence-sync] Cron failed:", err);

    logEvent({
      type:    "system.cron_failure",
      source:  "cron",
      summary: `cadence-sync cron failed: ${message}`,
      importance: "high",
      metadata: { cron: "cadence-sync", error: message },
    });

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
