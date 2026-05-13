#!/usr/bin/env node
/**
 * scripts/pull-to-obsidian.mjs
 *
 * Reads weekly analytics reports from Supabase and writes them to the
 * Obsidian vault. Run manually or via cron after the Vercel Cron job fires.
 *
 * Usage:
 *   node /root/islandinvestorsnj/scripts/pull-to-obsidian.mjs
 *
 * Cron (every Sunday at 5:30 PM — 30 min after Vercel collection):
 *   30 17 * * 0  node /root/islandinvestorsnj/scripts/pull-to-obsidian.mjs >> /root/analytics-pull.log 2>&1
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";
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
    // .env.local may not exist in some environments
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[pull-to-obsidian] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const VAULT = "/sdcard/Documents/Obsidian/Island investors branding";
const ANALYTICS_DIR = join(VAULT, "Analytics");
const REPORTS_DIR = join(ANALYTICS_DIR, "Weekly Reports");
const INDEX_PATH = join(ANALYTICS_DIR, "index.md");
const LOG_PATH = join(ANALYTICS_DIR, "log.md");

// ─── Supabase REST helpers ────────────────────────────────────────────────────

async function supabaseGet(path, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Supabase GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function supabasePatch(path, match, body) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
  Object.entries(match).forEach(([k, v]) => url.searchParams.set(k, `eq.${v}`));
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Supabase PATCH ${path} → ${res.status}: ${await res.text()}`);
}

// ─── Obsidian index helpers ───────────────────────────────────────────────────

function ensureIndex() {
  if (existsSync(INDEX_PATH)) return;
  writeFileSync(INDEX_PATH, [
    "# Analytics — Island Investors NJ",
    "",
    "Weekly analytics snapshots collected automatically every Sunday at 5:00 PM.",
    "",
    "**Source:** GA4 Data API + Supabase form submissions  ",
    "**Property:** islandinvestorsnj.com  ",
    "**Related:** [[LLM Wiki/10-analytics]] | [[LLM Wiki/log]]",
    "",
    "---",
    "",
    "## Weekly Reports",
    "",
    "<!-- newest first -->",
    "",
  ].join("\n"), "utf8");
  console.log("[pull-to-obsidian] Created Analytics/index.md");
}

function addToIndex(reportDate, fileName) {
  let content = readFileSync(INDEX_PATH, "utf8");
  const link = `- [[Weekly Reports/${fileName.replace(".md", "")}]] — ${reportDate}`;
  const marker = "<!-- newest first -->";
  if (content.includes(marker)) {
    content = content.replace(marker, `${marker}\n${link}`);
  } else {
    content += `${link}\n`;
  }
  writeFileSync(INDEX_PATH, content, "utf8");
}

// ─── Obsidian log helpers ─────────────────────────────────────────────────────

function ensureLog() {
  if (existsSync(LOG_PATH)) return;
  writeFileSync(LOG_PATH, [
    "# Analytics Log — Island Investors NJ",
    "",
    "Append-only record of weekly report collections and Obsidian syncs.",
    "",
    "---",
    "",
  ].join("\n"), "utf8");
  console.log("[pull-to-obsidian] Created Analytics/log.md");
}

function appendLog(reportDate, sessions, forms, ga4Configured) {
  const entry = [
    `## [${reportDate}] Weekly report`,
    "",
    `**Source:** ${ga4Configured ? "GA4 + Supabase" : "Supabase only (GA4 not configured)"}  `,
    `**Sessions:** ${sessions ?? "N/A"}  `,
    `**Form submissions:** ${forms}  `,
    `**Report:** [[Weekly Reports/${reportDate} Weekly Analytics Report]]`,
    "",
    "---",
    "",
  ].join("\n");
  appendFileSync(LOG_PATH, entry, "utf8");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("[pull-to-obsidian] Starting…");

  mkdirSync(REPORTS_DIR, { recursive: true });
  ensureIndex();
  ensureLog();

  // Fetch all reports not yet pulled (or re-pull if file missing)
  const reports = await supabaseGet("analytics_weekly_reports", {
    pulled_to_obsidian: "eq.false",
    order: "report_date.asc",
    select: "id,report_date,report_markdown,data_json,pulled_to_obsidian",
  });

  if (!reports.length) {
    console.log("[pull-to-obsidian] No new reports to pull.");
    return;
  }

  console.log(`[pull-to-obsidian] ${reports.length} report(s) to sync.`);

  for (const report of reports) {
    const reportDate = report.report_date; // "2026-05-18"
    const fileName = `${reportDate} Weekly Analytics Report.md`;
    const filePath = join(REPORTS_DIR, fileName);

    // Write the report
    writeFileSync(filePath, report.report_markdown, "utf8");
    console.log(`[pull-to-obsidian] Written: ${filePath}`);

    // Update Obsidian index and log
    addToIndex(reportDate, fileName);

    const data = report.data_json ?? {};
    const sessions = data.overview?.this?.sessions ?? null;
    const forms = (data.submissions?.this?.seller ?? 0) + (data.submissions?.this?.partner ?? 0);
    appendLog(reportDate, sessions, forms, data.ga4Configured ?? false);

    // Mark as pulled in Supabase
    await supabasePatch("analytics_weekly_reports", { id: report.id }, { pulled_to_obsidian: true });
    console.log(`[pull-to-obsidian] Marked ${reportDate} as pulled.`);
  }

  console.log("[pull-to-obsidian] Done.");
}

main().catch(err => {
  console.error("[pull-to-obsidian] Fatal:", err);
  process.exit(1);
});
