#!/usr/bin/env node
/**
 * scripts/sync-cadence-vault.mjs
 *
 * Reads new Cadence events from Supabase and writes structured notes into the
 * Obsidian vault. Designed to run locally (vault is on-device, not reachable
 * from Vercel). Follows the same pattern as pull-to-obsidian.mjs.
 *
 * Usage:
 *   node /root/islandinvestorsnj/scripts/sync-cadence-vault.mjs
 *   npm run sync:vault
 *
 * Required env vars (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CADENCE_VAULT_PATH   — absolute path to vault root
 *   CADENCE_VAULT_ID     — logical vault name, e.g. "hq-framework"
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Env ──────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(PROJECT_ROOT, ".env.local");
  try {
    readFileSync(envPath, "utf8")
      .split("\n")
      .forEach(line => {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      });
  } catch {
    // .env.local may not exist
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VAULT_PATH   = process.env.CADENCE_VAULT_PATH;
const VAULT_ID     = process.env.CADENCE_VAULT_ID ?? "hq-framework";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[sync-cadence-vault] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!VAULT_PATH) {
  console.error("[sync-cadence-vault] Missing CADENCE_VAULT_PATH — set it in .env.local");
  process.exit(1);
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const ENTITIES_DIR = join(VAULT_PATH, "Cadence", "Entities");
const LOGS_DIR     = join(VAULT_PATH, "Cadence", "Operational Logs");

// ─── Supabase REST helpers ────────────────────────────────────────────────────

const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

async function sbGet(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: SB_HEADERS });
  if (!res.ok) throw new Error(`Supabase GET ${table} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sbPost(table, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...SB_HEADERS, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase POST ${table} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sbPatch(table, matchCol, matchVal, body) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  url.searchParams.set(matchCol, `eq.${matchVal}`);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { ...SB_HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${table} → ${res.status}: ${await res.text()}`);
}

// ─── Sync state ───────────────────────────────────────────────────────────────

async function getSyncState() {
  const rows = await sbGet("cadence_sync_state", {
    vault_id: `eq.${VAULT_ID}`,
    select: "*",
  });
  if (rows.length) return rows[0];

  const created = await sbPost("cadence_sync_state", {
    vault_id: VAULT_ID,
    last_synced_at: null,
    events_synced: 0,
  });
  return Array.isArray(created) ? created[0] : created;
}

async function updateSyncState(syncState, syncStart, newEventCount) {
  if (!syncState?.id) return;
  await sbPatch("cadence_sync_state", "id", syncState.id, {
    last_synced_at: syncStart,
    last_run_at: new Date().toISOString(),
    events_synced: (syncState.events_synced ?? 0) + newEventCount,
  });
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatFull(timestamp) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "America/New_York",
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "America/New_York",
  });
}

function formatTimelineEntry(event) {
  const importance = event.importance === "high" ? " `HIGH`" : "";
  return `- ${formatFull(event.timestamp)} — \`${event.type}\` — ${event.summary}${importance}`;
}

function formatDailyEntry(event) {
  const importance = event.importance === "high" ? " `HIGH`" : "";
  const entity = event.entity_id ? ` — [[${event.entity_id}]]` : "";
  return `- ${formatTime(event.timestamp)} — \`${event.type}\` — ${event.summary}${importance}${entity}`;
}

function getETDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

// ─── Marker helpers ───────────────────────────────────────────────────────────

// Appends newEntry before the end marker. If markers are absent, appends the
// entire marker block at EOF rather than assuming the file is auto-generated.
function appendToSection(content, markerName, newEntry) {
  const end = `<!-- ${markerName}-end -->`;
  if (content.includes(end)) {
    return content.replace(end, `${newEntry}\n${end}`);
  }
  const start = `<!-- ${markerName}-start -->`;
  return content.trimEnd() + `\n\n${start}\n${newEntry}\n${end}\n`;
}

// Replaces all content between markers (relationships section is auto-only).
function replaceSection(content, markerName, newContent) {
  const start = `<!-- ${markerName}-start -->`;
  const end   = `<!-- ${markerName}-end -->`;
  const si = content.indexOf(start);
  const ei = content.indexOf(end);
  if (si === -1 || ei === -1) {
    return content.trimEnd() + `\n\n${start}\n${newContent}\n${end}\n`;
  }
  return content.slice(0, si + start.length) + `\n${newContent}\n` + content.slice(ei);
}

// ─── Entity ID sanitization ───────────────────────────────────────────────────

function sanitizeEntityId(id) {
  return id.replace(/[/\\<>:"|?*\x00]/g, "_").replace(/^\.+/, "_");
}

// ─── Relationship block ───────────────────────────────────────────────────────

function generateRelationshipsBlock(contexts, subjectEntityId) {
  if (!contexts.length) return "_No relationships recorded._";
  return contexts
    .map(ctx =>
      ctx.entity_id_a === subjectEntityId
        ? `- → \`${ctx.relationship}\` → [[${ctx.entity_id_b}]] _(${ctx.entity_type_b})_`
        : `- ← \`${ctx.relationship}\` ← [[${ctx.entity_id_a}]] _(${ctx.entity_type_a})_`
    )
    .join("\n");
}

// ─── Note generators ──────────────────────────────────────────────────────────

function generateEntityNote(entityType, entityId, events, contexts) {
  const firstEvent = events[0];
  const firstTimestamp = firstEvent ? formatFull(firstEvent.timestamp) : "Unknown";
  const source = firstEvent?.source ?? "unknown";
  const timelineEntries = events.map(formatTimelineEntry).join("\n") || "_No events recorded._";
  const relBlock = generateRelationshipsBlock(contexts, entityId);

  return [
    `# ${entityId}`,
    "",
    `**Entity type:** \`${entityType}\``,
    `**First seen:** ${firstTimestamp}`,
    `**Source:** \`${source}\``,
    "",
    "---",
    "",
    "## Overview",
    "",
    "> _Auto-generated from first Cadence event. Edit freely — this section is never overwritten._",
    "",
    firstEvent?.summary ?? "_No events recorded._",
    "",
    "---",
    "",
    "## Timeline",
    "",
    "<!-- cadence:timeline-start -->",
    timelineEntries,
    "<!-- cadence:timeline-end -->",
    "",
    "---",
    "",
    "## Relationships",
    "",
    "<!-- cadence:relationships-start -->",
    relBlock,
    "<!-- cadence:relationships-end -->",
    "",
    "---",
    "",
    "## Notes",
    "",
    "> _Manual notes only. This section is never written by the sync script._",
    "",
  ].join("\n");
}

function generateDailyLog(date, events) {
  const entries = events.map(formatDailyEntry).join("\n") || "_No events._";
  return [
    `# Cadence Log — ${date}`,
    "",
    `**Date:** ${date}`,
    `**Events:** ${events.length}`,
    "",
    "---",
    "",
    "<!-- cadence:daily-start -->",
    entries,
    "<!-- cadence:daily-end -->",
    "",
  ].join("\n");
}

// ─── Entity note processor ────────────────────────────────────────────────────

async function fetchEntityContexts(entityType, entityId) {
  const [ctxA, ctxB] = await Promise.all([
    sbGet("cadence_contexts", {
      entity_type_a: `eq.${entityType}`,
      entity_id_a: `eq.${entityId}`,
      select: "*",
    }),
    sbGet("cadence_contexts", {
      entity_type_b: `eq.${entityType}`,
      entity_id_b: `eq.${entityId}`,
      select: "*",
    }),
  ]);
  return [...ctxA, ...ctxB];
}

async function processEntityNote(entityType, entityId, newEvents) {
  const safeId = sanitizeEntityId(entityId);
  const entityDir = join(ENTITIES_DIR, entityType);
  const notePath = join(entityDir, `${safeId}.md`);

  mkdirSync(entityDir, { recursive: true });

  if (!existsSync(notePath)) {
    // New entity — fetch complete event history and all contexts
    const [allEvents, contexts] = await Promise.all([
      sbGet("cadence_events", {
        entity_type: `eq.${entityType}`,
        entity_id: `eq.${entityId}`,
        order: "timestamp.asc",
        select: "*",
      }),
      fetchEntityContexts(entityType, entityId),
    ]);
    writeFileSync(notePath, generateEntityNote(entityType, entityId, allEvents, contexts), "utf8");
    console.log(`  [NEW] Entities/${entityType}/${safeId}.md`);
  } else {
    // Existing entity — append timeline entries, refresh relationships block
    let content = readFileSync(notePath, "utf8");
    const newEntries = newEvents.map(formatTimelineEntry).join("\n");
    content = appendToSection(content, "cadence:timeline", newEntries);

    const contexts = await fetchEntityContexts(entityType, entityId);
    const relBlock = generateRelationshipsBlock(contexts, entityId);
    content = replaceSection(content, "cadence:relationships", relBlock);

    writeFileSync(notePath, content, "utf8");
    console.log(`  [UPD] Entities/${entityType}/${safeId}.md`);
  }
}

// ─── Daily log processor ──────────────────────────────────────────────────────

function processDailyLog(date, events) {
  const logPath = join(LOGS_DIR, `${date}.md`);

  if (!existsSync(logPath)) {
    writeFileSync(logPath, generateDailyLog(date, events), "utf8");
    console.log(`  [NEW] Operational Logs/${date}.md`);
  } else {
    let content = readFileSync(logPath, "utf8");
    const newEntries = events.map(formatDailyEntry).join("\n");
    content = appendToSection(content, "cadence:daily", newEntries);
    writeFileSync(logPath, content, "utf8");
    console.log(`  [UPD] Operational Logs/${date}.md`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[sync-cadence-vault] Starting — vault: ${VAULT_ID}`);

  mkdirSync(ENTITIES_DIR, { recursive: true });
  mkdirSync(LOGS_DIR,     { recursive: true });

  const syncState = await getSyncState();

  // Capture syncStart BEFORE fetching — prevents a race where events that arrive
  // between query and state-update would be permanently skipped.
  const syncStart = new Date().toISOString();

  // Fetch new events since last sync
  const params = { order: "timestamp.asc", select: "*" };
  if (syncState?.last_synced_at) {
    params.timestamp = `gt.${syncState.last_synced_at}`;
  }
  const events = await sbGet("cadence_events", params);

  if (!events.length) {
    console.log("[sync-cadence-vault] Nothing to do — no new events.");
    await sbPatch("cadence_sync_state", "vault_id", VAULT_ID, {
      last_run_at: new Date().toISOString(),
    });
    return;
  }

  console.log(`[sync-cadence-vault] ${events.length} event(s) to process.`);

  // Group events with entity references by (entityType, entityId)
  const entityGroups = new Map();
  for (const event of events) {
    if (!event.entity_type || !event.entity_id) continue;
    const key = `${event.entity_type}::${event.entity_id}`;
    if (!entityGroups.has(key)) {
      entityGroups.set(key, { entityType: event.entity_type, entityId: event.entity_id, events: [] });
    }
    entityGroups.get(key).events.push(event);
  }

  // Process entity notes sequentially (each may hit Supabase)
  for (const [, group] of entityGroups) {
    await processEntityNote(group.entityType, group.entityId, group.events);
  }

  // Group all events by ET date for daily logs
  const dailyGroups = new Map();
  for (const event of events) {
    const date = getETDate(event.timestamp);
    if (!dailyGroups.has(date)) dailyGroups.set(date, []);
    dailyGroups.get(date).push(event);
  }

  for (const [date, dayEvents] of dailyGroups) {
    processDailyLog(date, dayEvents);
  }

  await updateSyncState(syncState, syncStart, events.length);
  console.log(`[sync-cadence-vault] Done. ${events.length} event(s) synced.`);
}

main().catch(err => {
  console.error("[sync-cadence-vault] Fatal:", err);
  process.exit(1);
});
