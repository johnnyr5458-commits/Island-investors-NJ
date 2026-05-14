// Pure TypeScript utilities for Cadence vault sync.
// No Supabase, no side effects in the formatter section.
// readEntityVaultNote is the sole filesystem-reading function (Phase 4).
// The .mjs sync script inlines equivalent JS logic to avoid a build step.

export interface VaultEvent {
  id: string;
  type: string;
  timestamp: string;
  actor: string | null;
  source: string;
  summary: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  importance: "normal" | "high";
}

export interface VaultContext {
  id: string;
  entity_type_a: string;
  entity_id_a: string;
  relationship: string;
  entity_type_b: string;
  entity_id_b: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface EntityNoteData {
  entityType: string;
  entityId: string;
  events: VaultEvent[];
  contexts: VaultContext[];
}

export const MARKER_TIMELINE = "cadence:timeline";
export const MARKER_RELATIONS = "cadence:relationships";
export const MARKER_DAILY = "cadence:daily";

export function markerStart(name: string): string {
  return `<!-- ${name}-start -->`;
}

export function markerEnd(name: string): string {
  return `<!-- ${name}-end -->`;
}

function formatFull(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "America/New_York",
  });
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "America/New_York",
  });
}

export function formatTimelineEntry(event: VaultEvent): string {
  const importance = event.importance === "high" ? " `HIGH`" : "";
  return `- ${formatFull(event.timestamp)} — \`${event.type}\` — ${event.summary}${importance}`;
}

function formatDailyEntry(event: VaultEvent): string {
  const importance = event.importance === "high" ? " `HIGH`" : "";
  const entity = event.entity_id ? ` — [[${event.entity_id}]]` : "";
  return `- ${formatTime(event.timestamp)} — \`${event.type}\` — ${event.summary}${importance}${entity}`;
}

// Inserts newEntry before the end marker. If markers are missing, appends the
// full marker block at EOF rather than assuming the file is auto-generated.
export function appendToSection(fileContent: string, markerName: string, newEntry: string): string {
  const end = markerEnd(markerName);
  if (fileContent.includes(end)) {
    return fileContent.replace(end, `${newEntry}\n${end}`);
  }
  const start = markerStart(markerName);
  return fileContent.trimEnd() + `\n\n${start}\n${newEntry}\n${end}\n`;
}

// Replaces all content between markers (used for relationships — auto-only section).
export function replaceSection(fileContent: string, markerName: string, newContent: string): string {
  const start = markerStart(markerName);
  const end = markerEnd(markerName);
  const startIdx = fileContent.indexOf(start);
  const endIdx = fileContent.indexOf(end);
  if (startIdx === -1 || endIdx === -1) {
    return fileContent.trimEnd() + `\n\n${start}\n${newContent}\n${end}\n`;
  }
  return (
    fileContent.slice(0, startIdx + start.length) +
    `\n${newContent}\n` +
    fileContent.slice(endIdx)
  );
}

export function generateRelationshipsBlock(contexts: VaultContext[], subjectEntityId: string): string {
  if (!contexts.length) return "_No relationships recorded._";
  return contexts
    .map(ctx =>
      ctx.entity_id_a === subjectEntityId
        ? `- → \`${ctx.relationship}\` → [[${ctx.entity_id_b}]] _(${ctx.entity_type_b})_`
        : `- ← \`${ctx.relationship}\` ← [[${ctx.entity_id_a}]] _(${ctx.entity_type_a})_`
    )
    .join("\n");
}

export function generateEntityNote(data: EntityNoteData): string {
  const { entityType, entityId, events, contexts } = data;
  const firstEvent = events[0];
  const firstTimestamp = firstEvent ? formatFull(firstEvent.timestamp) : "Unknown";
  const source = firstEvent?.source ?? "unknown";
  const timelineEntries = events.map(formatTimelineEntry).join("\n") || "_No events recorded._";
  const relationshipsContent = generateRelationshipsBlock(contexts, entityId);

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
    markerStart(MARKER_TIMELINE),
    timelineEntries,
    markerEnd(MARKER_TIMELINE),
    "",
    "---",
    "",
    "## Relationships",
    "",
    markerStart(MARKER_RELATIONS),
    relationshipsContent,
    markerEnd(MARKER_RELATIONS),
    "",
    "---",
    "",
    "## Notes",
    "",
    "> _Manual notes only. This section is never written by the sync script._",
    "",
  ].join("\n");
}

export function generateDailyLog(date: string, events: VaultEvent[]): string {
  const entries = events.map(formatDailyEntry).join("\n") || "_No events._";
  return [
    `# Cadence Log — ${date}`,
    "",
    `**Date:** ${date}`,
    `**Events:** ${events.length}`,
    "",
    "---",
    "",
    markerStart(MARKER_DAILY),
    entries,
    markerEnd(MARKER_DAILY),
    "",
  ].join("\n");
}

export function appendToDailyLog(existing: string, events: VaultEvent[]): string {
  const newEntries = events.map(formatDailyEntry).join("\n");
  return appendToSection(existing, MARKER_DAILY, newEntries);
}

// ── Phase 4: Vault Note Reading ───────────────────────────────────────────────

import type { VaultNoteResult } from "@/lib/supabase/types";
import { readFileSync } from "fs";
import { join } from "path";

export async function readEntityVaultNote(
  entityType: string,
  entityId: string
): Promise<VaultNoteResult | null> {
  const vaultPath = process.env.CADENCE_VAULT_PATH;
  if (!vaultPath) return null;

  const notePath = join(vaultPath, "Cadence", "Entities", entityType, `${entityId}.md`);

  try {
    const content = readFileSync(notePath, "utf-8");
    const sections: VaultNoteResult["sections"] = {};

    // Extract timeline section
    const tlStart = content.indexOf(markerStart(MARKER_TIMELINE));
    const tlEnd = content.indexOf(markerEnd(MARKER_TIMELINE));
    if (tlStart !== -1 && tlEnd !== -1) {
      sections.timeline = content
        .slice(tlStart + markerStart(MARKER_TIMELINE).length, tlEnd)
        .trim();
    }

    // Extract relationships section
    const rlStart = content.indexOf(markerStart(MARKER_RELATIONS));
    const rlEnd = content.indexOf(markerEnd(MARKER_RELATIONS));
    if (rlStart !== -1 && rlEnd !== -1) {
      sections.relationships = content
        .slice(rlStart + markerStart(MARKER_RELATIONS).length, rlEnd)
        .trim();
    }

    return { path: notePath, exists: true, sections };
  } catch {
    return { path: notePath, exists: false };
  }
}
