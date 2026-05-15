#!/usr/bin/env node
/**
 * scripts/sync-blog-status.mjs
 *
 * Cadence Blog Sync — reads published posts from Supabase and updates the
 * Obsidian vault: Blog Status Tracker, Published index, file moves, Analytics
 * log, and Cadence event.
 *
 * Modes:
 *   observe  (default) — diff report only, no writes
 *   sync     — full update: tracker + file move + published index + log + event
 *   maintain — metadata update only: tracker + log, no file moves
 *
 * Usage:
 *   npm run sync:blog                        # observe (safe default)
 *   npm run sync:blog -- --mode sync         # apply all updates
 *   npm run sync:blog -- --mode maintain     # metadata only, no file moves
 *
 * Cron (daily at 6:00 PM local — adjust to your timezone):
 *   0 18 * * *  node /root/islandinvestorsnj/scripts/sync-blog-status.mjs >> /root/blog-sync.log 2>&1
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readdirSync,
  renameSync,
  mkdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Mode ─────────────────────────────────────────────────────────────────────

const VALID_MODES = ["observe", "sync", "maintain"];

function parseMode(argv) {
  const idx = argv.indexOf("--mode");
  if (idx === -1) return "observe";
  const m = argv[idx + 1];
  if (!m || !VALID_MODES.includes(m)) {
    console.error(`[sync-blog] Invalid mode "${m ?? ""}". Use: observe | sync | maintain`);
    process.exit(1);
  }
  return m;
}

const MODE = parseMode(process.argv);

// ─── Env ──────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(PROJECT_ROOT, ".env.local");
  try {
    readFileSync(envPath, "utf8")
      .split("\n")
      .forEach((line) => {
        const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
        }
      });
  } catch {
    // .env.local may not exist in all environments
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[sync-blog] Missing required env vars:\n" +
    "  NEXT_PUBLIC_SUPABASE_URL\n" +
    "  SUPABASE_SERVICE_ROLE_KEY\n" +
    "Add them to .env.local"
  );
  process.exit(1);
}

// ─── Vault paths ──────────────────────────────────────────────────────────────

// BLOG_SYNC_VAULT_PATH overrides the default — distinct from CADENCE_VAULT_PATH
// which points to the HQ Framework vault (used by sync-cadence-vault.mjs)
const VAULT =
  process.env.BLOG_SYNC_VAULT_PATH ||
  "/sdcard/Documents/Obsidian/Island investors branding";

const TRACKER_PATH = join(VAULT, "Blog Ecosystem", "Blog Status Tracker.md");
const POSTS_DIR    = join(VAULT, "Blog Ecosystem", "Posts");
const PUB_DIR      = join(VAULT, "Blog Ecosystem", "Published");
const PUB_INDEX    = join(VAULT, "Blog Ecosystem", "Published", "index.md");
const LOG_PATH     = join(VAULT, "Analytics", "log.md");
const BASE_URL     = "https://www.islandinvestorsnj.com/blog";

// ─── Marker helpers ───────────────────────────────────────────────────────────

const MARKERS = {
  statusStart:   "<!-- cadence:blog-status-start -->",
  statusEnd:     "<!-- cadence:blog-status-end -->",
  progressStart: "<!-- cadence:blog-progress-start -->",
  progressEnd:   "<!-- cadence:blog-progress-end -->",
  pubListStart:  "<!-- cadence:published-list-start -->",
  pubListEnd:    "<!-- cadence:published-list-end -->",
};

function getBetween(content, start, end) {
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) return null;
  return content.substring(s + start.length, e);
}

function replaceBetween(content, start, end, replacement) {
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) {
    throw new Error(`Sync markers not found: ${start}`);
  }
  return content.substring(0, s + start.length) + replacement + content.substring(e);
}

// ─── Table parsing ────────────────────────────────────────────────────────────

/**
 * Parse tracker rows from the content between status markers.
 * Returns { day, cat, title, status, publishDate, slug, notes, raw }[]
 */
function parseTrackerRows(tableContent) {
  return tableContent
    .split("\n")
    .filter((line) => line.trim().startsWith("|") && !line.includes("---"))
    .slice(1) // skip header row
    .map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      // parts[0]="" [1]=# [2]=Cat [3]=Title [4]=Status [5]=PublishDate [6]=Slug [7]=Notes [8]=""
      return {
        day:         parts[1] ?? "",
        cat:         parts[2] ?? "",
        title:       parts[3] ?? "",
        status:      parts[4] ?? "",
        publishDate: parts[5] ?? "",
        slug:        parts[6] ?? "",
        notes:       parts[7] ?? "",
        raw:         line,
      };
    })
    .filter((r) => r.slug.length > 0);
}

/**
 * Rebuild a table row with updated status, publish date, and live URL in notes.
 */
function buildUpdatedRow(row, publishDate, liveUrl) {
  const parts = row.raw.split("|");
  parts[4] = ` 🚀 `;
  parts[5] = ` ${publishDate} `;
  parts[7] = ` ${liveUrl} `;
  return parts.join("|");
}

// ─── Supabase REST ────────────────────────────────────────────────────────────

async function supabaseGet(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      throw new Error(`Supabase GET ${table} → ${res.status}: ${await res.text()}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function supabasePost(table, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Supabase POST ${table} → ${res.status}: ${await res.text()}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

// ─── File helpers ─────────────────────────────────────────────────────────────

/**
 * Find the .md file in Posts/ whose name starts with the padded day number.
 * "01" → finds "01 — PF — Before the Sheriff Sale in NJ.md"
 */
function findPostFile(day) {
  if (!existsSync(POSTS_DIR)) return null;
  const padded = day.padStart(2, "0");
  const files = readdirSync(POSTS_DIR);
  return files.find((f) => f.startsWith(padded + " — ")) ?? null; // em dash
}

// ─── Published index ──────────────────────────────────────────────────────────

function updatePublishedIndex(updates) {
  if (!existsSync(PUB_INDEX)) {
    // Build fresh index
    const rows = updates
      .map((u) => `| ${u.title} | \`${u.slug}\` | ${u.publishedAt} | [Live](${u.liveUrl}) |`)
      .join("\n");
    writeFileSync(
      PUB_INDEX,
      [
        "# Published — Index",
        "",
        "Posts that are live on `islandinvestorsnj.com/blog/`.",
        "",
        "**Maintained by:** Cadence Blog Sync (`npm run sync:blog -- --mode sync`)",
        "",
        "| Post | Slug | Publish Date | Live URL |",
        "|------|------|-------------|---------|",
        MARKERS.pubListStart,
        rows,
        MARKERS.pubListEnd,
        "",
        "*Cross-reference `Blog Status Tracker.md` for full status board.*",
      ].join("\n"),
      "utf8"
    );
    console.log("  ✓ Created Published/index.md");
    return;
  }

  const content = readFileSync(PUB_INDEX, "utf8");
  const listSection = getBetween(content, MARKERS.pubListStart, MARKERS.pubListEnd);

  if (!listSection) {
    // No markers — safe append at end
    const rows = updates
      .map((u) => `| ${u.title} | \`${u.slug}\` | ${u.publishedAt} | [Live](${u.liveUrl}) |`)
      .join("\n");
    writeFileSync(PUB_INDEX, content.trimEnd() + "\n\n" + rows + "\n", "utf8");
    console.log("  ✓ Updated Published/index.md (no markers — appended)");
    return;
  }

  // Append new rows within the marker section
  const existing = listSection.trim() === "(none yet)" ? "" : listSection.trim();
  const newRows = updates
    .map((u) => `| ${u.title} | \`${u.slug}\` | ${u.publishedAt} | [Live](${u.liveUrl}) |`)
    .join("\n");
  const combined = [existing, newRows].filter(Boolean).join("\n");
  const updated = replaceBetween(
    content,
    MARKERS.pubListStart,
    MARKERS.pubListEnd,
    `\n${combined}\n`
  );
  writeFileSync(PUB_INDEX, updated, "utf8");
  console.log("  ✓ Updated Published/index.md");
}

// ─── Analytics log ────────────────────────────────────────────────────────────

function appendToAnalyticsLog(updates) {
  if (!existsSync(LOG_PATH)) {
    console.log("  [warn] Analytics/log.md not found — skipping log entry");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  const existing = readFileSync(LOG_PATH, "utf8");

  // Idempotent — skip if today's blog sync entry already exists
  if (existing.includes(`## [${today}] Blog sync`)) {
    console.log(`  [skip] Analytics/log.md already has a blog sync entry for ${today}`);
    return;
  }

  const lines = updates
    .map((u) => `- ${today} — 🚀 "${u.title}" | \`${u.slug}\` | ${u.liveUrl}`)
    .join("\n");
  const entry = `\n## [${today}] Blog sync\n\n${lines}\n\n---\n\n`;
  appendFileSync(LOG_PATH, entry, "utf8");
  console.log("  ✓ Appended to Analytics/log.md");
}

// ─── Cadence event ────────────────────────────────────────────────────────────

async function logCadenceEvent(updates) {
  try {
    await supabasePost("cadence_events", {
      type: "cadence.blog_sync_completed",
      source: "blog-sync-script",
      importance: "normal",
      summary: `Blog sync completed: ${updates.length} post(s) updated`,
      metadata: {
        mode: MODE,
        posts_updated: updates.length,
        slugs: updates.map((u) => u.slug),
      },
    });
    console.log("  ✓ Cadence event logged (cadence.blog_sync_completed)");
  } catch (err) {
    // Non-fatal — sync succeeds even if event logging fails
    console.log(`  [warn] Cadence event failed: ${err.message}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n[sync-blog] ─────────────────────────────────────────`);
  console.log(`[sync-blog] Mode:  ${MODE.toUpperCase()}`);
  console.log(`[sync-blog] Vault: ${VAULT}`);
  console.log(`[sync-blog] ─────────────────────────────────────────`);

  // 1. Fetch published posts from Supabase
  console.log("\n[sync-blog] Fetching published posts from Supabase…");
  let publishedPosts;
  try {
    publishedPosts = await supabaseGet("blog_posts", {
      status: "eq.published",
      select: "slug,title,published_at",
      order: "published_at.asc",
    });
  } catch (err) {
    console.error(`[sync-blog] Supabase fetch failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`[sync-blog] ${publishedPosts.length} published post(s) in Supabase`);

  // 2. Read and validate Blog Status Tracker
  if (!existsSync(TRACKER_PATH)) {
    console.error(`[sync-blog] Blog Status Tracker not found:\n  ${TRACKER_PATH}`);
    process.exit(1);
  }

  const trackerContent = readFileSync(TRACKER_PATH, "utf8");
  const tableSection = getBetween(
    trackerContent,
    MARKERS.statusStart,
    MARKERS.statusEnd
  );

  if (!tableSection) {
    console.error(
      `[sync-blog] Sync markers missing from Blog Status Tracker.\n` +
      `  Add these markers around the status table:\n` +
      `  ${MARKERS.statusStart}\n` +
      `  ${MARKERS.statusEnd}`
    );
    process.exit(1);
  }

  const rows = parseTrackerRows(tableSection);
  const alreadySynced = rows.filter((r) => r.status === "🚀").length;
  console.log(
    `[sync-blog] ${rows.length} posts tracked | ${alreadySynced} already 🚀`
  );

  // 3. Build diff
  const toUpdate = [];
  for (const post of publishedPosts) {
    const row = rows.find((r) => r.slug === post.slug);
    if (!row) {
      console.log(`  [skip] ${post.slug} — not in tracker (standalone post)`);
      continue;
    }
    if (row.status === "🚀") continue;

    const publishedAt = post.published_at
      ? post.published_at.split("T")[0]
      : new Date().toISOString().split("T")[0];

    toUpdate.push({
      ...post,
      row,
      publishedAt,
      liveUrl: `${BASE_URL}/${post.slug}`,
    });
  }

  // 4. Diff report
  console.log(`\n[sync-blog] Needs update: ${toUpdate.length} post(s)`);
  if (toUpdate.length > 0) {
    for (const item of toUpdate) {
      console.log(`  → Day ${item.row.day} | ${item.title}`);
      console.log(`    ${item.liveUrl}`);
    }
  } else {
    console.log("  Vault matches Supabase — nothing to do.");
  }

  if (MODE === "observe" || toUpdate.length === 0) {
    console.log(`\n[sync-blog] Done (${MODE} mode — no writes)\n`);
    return;
  }

  // 5. Update Blog Status Tracker table rows
  console.log(`\n[sync-blog] Updating Blog Status Tracker…`);
  let updatedTableSection = tableSection;
  for (const item of toUpdate) {
    const updatedRow = buildUpdatedRow(item.row, item.publishedAt, item.liveUrl);
    updatedTableSection = updatedTableSection.replace(item.row.raw, updatedRow);
  }

  let updatedContent = replaceBetween(
    trackerContent,
    MARKERS.statusStart,
    MARKERS.statusEnd,
    updatedTableSection
  );

  // Update progress summary if markers present
  if (updatedContent.includes(MARKERS.progressStart)) {
    const newPublished = alreadySynced + toUpdate.length;
    const newNotStarted = rows.length - newPublished;
    const newProgress =
      `\n**Published:** ${newPublished} / ${rows.length} | ` +
      `**In Progress:** 0 / ${rows.length} | ` +
      `**Not Started:** ${newNotStarted} / ${rows.length}\n`;
    updatedContent = replaceBetween(
      updatedContent,
      MARKERS.progressStart,
      MARKERS.progressEnd,
      newProgress
    );
  }

  writeFileSync(TRACKER_PATH, updatedContent, "utf8");
  console.log(`  ✓ Blog Status Tracker updated (${toUpdate.length} row(s))`);

  // 6. File moves + published index (sync mode only)
  if (MODE === "sync") {
    mkdirSync(PUB_DIR, { recursive: true });

    for (const item of toUpdate) {
      const postFile = findPostFile(item.row.day);
      if (postFile) {
        const src  = join(POSTS_DIR, postFile);
        const dest = join(PUB_DIR, postFile);
        renameSync(src, dest);
        console.log(`  ✓ Moved: Posts/${postFile}`);
        console.log(`       → Published/${postFile}`);
      } else {
        console.log(
          `  [warn] No file found for Day ${item.row.day} in Posts/ — skipping move`
        );
      }
    }

    updatePublishedIndex(toUpdate);
    await logCadenceEvent(toUpdate);
  }

  // 7. Append to Analytics log (both sync + maintain)
  appendToAnalyticsLog(toUpdate);

  console.log(
    `\n[sync-blog] ✓ ${toUpdate.length} post(s) synced in ${MODE} mode\n`
  );
}

main().catch((err) => {
  console.error("[sync-blog] Fatal:", err);
  process.exit(1);
});
