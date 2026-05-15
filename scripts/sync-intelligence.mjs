#!/usr/bin/env node
/**
 * scripts/sync-intelligence.mjs
 *
 * Cadence Intelligence Engine — processes operational events from Supabase and
 * the Obsidian vault, then maintains the Intelligence/ section:
 *   - Creates Content Intelligence files for newly published posts
 *   - Logs classified events to daily Event Log files
 *   - Updates GA4 performance rows in Content Intelligence files (weekly mode)
 *   - Generates Weekly Intelligence reports (weekly mode)
 *   - Seeds and updates aggregate tracking tables
 *
 * Modes:
 *   observe  (default) — print pending work, no writes
 *   process  — create intelligence files, log events, update trackers
 *   weekly   — parse latest GA4 report + generate weekly intelligence report
 *
 * Usage:
 *   npm run sync:intelligence                  # observe (safe default)
 *   npm run sync:intelligence:process          # full intelligence processing
 *   npm run sync:intelligence:weekly           # weekly report generation
 *
 * Cron (daily + weekly):
 *   0 18 * * *  node /root/islandinvestorsnj/scripts/sync-intelligence.mjs --mode process >> /root/intelligence.log 2>&1
 *   0 19 * * 0  node /root/islandinvestorsnj/scripts/sync-intelligence.mjs --mode weekly >> /root/intelligence.log 2>&1
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// ─── Mode ─────────────────────────────────────────────────────────────────────

const VALID_MODES = ["observe", "process", "weekly"];
function parseMode(argv) {
  const idx = argv.indexOf("--mode");
  if (idx === -1) return "observe";
  const m = argv[idx + 1];
  if (!m || !VALID_MODES.includes(m)) {
    console.error(`[intelligence] Invalid mode "${m ?? ""}". Use: observe | process | weekly`);
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
  } catch { /* .env.local may not exist */ }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[intelligence] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// ─── Vault paths ──────────────────────────────────────────────────────────────

const VAULT = process.env.INTELLIGENCE_VAULT_PATH
  || "/sdcard/Documents/Obsidian/Island investors branding";

const INTEL_DIR       = join(VAULT, "Intelligence");
const CONTENT_DIR     = join(INTEL_DIR, "Content Intelligence");
const TRACKING_DIR    = join(INTEL_DIR, "Tracking");
const WEEKLY_DIR      = join(INTEL_DIR, "Weekly Intelligence");
const EVENT_LOG_DIR   = join(INTEL_DIR, "Event Log");
const ANALYTICS_DIR   = join(VAULT, "Analytics", "Weekly Reports");
const SOCIAL_DIR      = join(VAULT, "Social media");
const BASE_URL        = "https://www.islandinvestorsnj.com/blog";

// ─── Ecosystem metadata map ───────────────────────────────────────────────────
// Slug → { day, mode, modeFull, cat, catFull }
// Sourced from: Blog Ecosystem/00 — Cadence Map + Ecosystem Index.md

const CATEGORY_FULL = {
  PF: "People-First Distressed Sales",
  HM: "Hidden Math",
  SJ: "South Jersey Pull",
  CF: "Creative Finance",
  RR: "REAL Rules",
};

const MODE_FULL = {
  H: "Human/Emotional",
  E: "Educational/Strategic",
  T: "Technical/Authority",
  L: "Local/Identity",
  R: "Reflective/Perspective",
};

const ECOSYSTEM = {
  "before-sheriff-sale-nj-homeowner-options":        { day: "01", mode: "H", cat: "PF" },
  "real-cost-selling-house-new-jersey":               { day: "02", mode: "E", cat: "HM" },
  "island-vs-mainland-south-jersey-home-prices":      { day: "03", mode: "L", cat: "SJ" },
  "nj-inundation-risk-zone-shore-properties-real-rules": { day: "04", mode: "T", cat: "RR" },
  "lease-to-own-south-jersey-homeowner-guide":        { day: "05", mode: "R", cat: "CF" },
  "seller-financing-myths-nj-homeowners":             { day: "06", mode: "H", cat: "CF" },
  "nj-foreclosure-mediation-program-explained":       { day: "07", mode: "E", cat: "PF" },
  "cost-owning-vacant-property-atlantic-county":      { day: "08", mode: "T", cat: "HM" },
  "casino-economy-atlantic-city-homeowners-real-estate": { day: "09", mode: "L", cat: "SJ" },
  "renovation-trap-repairs-pay-off-selling-nj":       { day: "10", mode: "R", cat: "HM" },
  "subject-to-real-estate-nj-homeowner-guide":        { day: "11", mode: "E", cat: "CF" },
  "due-on-sale-clause-nj-creative-finance":           { day: "12", mode: "T", cat: "CF" },
  "nj-blue-acres-buyout-program-homeowners":          { day: "13", mode: "H", cat: "RR" },
  "emergency-mortgage-help-new-jersey-programs":      { day: "14", mode: "L", cat: "PF" },
  "flood-insurance-expensive-south-jersey-nfip":      { day: "15", mode: "R", cat: "RR" },
  "nj-seller-taxes-realty-transfer-fee-capital-gains":{ day: "16", mode: "T", cat: "HM" },
  "creative-finance-growing-south-jersey-2026":       { day: "17", mode: "H", cat: "CF" },
  "stockton-university-atlantic-city-real-estate-impact": { day: "18", mode: "E", cat: "SJ" },
  "cafra-real-rules-shore-property-renovation-nj":    { day: "19", mode: "L", cat: "RR" },
  "short-sale-vs-foreclosure-nj-differences":         { day: "20", mode: "R", cat: "PF" },
  "cafe-maps-atlantic-county-flood-elevation-explained": { day: "21", mode: "E", cat: "RR" },
  "short-term-rental-rules-ventnor-margate-atlantic-city": { day: "22", mode: "T", cat: "SJ" },
  "seniors-selling-home-new-jersey-guide":            { day: "23", mode: "H", cat: "PF" },
  "cash-offer-vs-traditional-listing-atlantic-county":{ day: "24", mode: "L", cat: "HM" },
  "coastal-erosion-south-jersey-property-values":     { day: "25", mode: "R", cat: "SJ" },
};

// ─── Hook classification ──────────────────────────────────────────────────────

function classifyHook(title) {
  const t = title.toLowerCase();
  if (/\bnot\b|\bmyth|\bnobody|\bsecret|\bwhen not|\bstop\b/.test(t)) return "Contrarian";
  if (/\bhow\b|\bwhat\b|\bwhy\b/.test(t) && !t.includes("?")) return "Direct Answer";
  if (/island\b|atlantic county|south jersey|ventnor|margate|ac\b|nj\b/.test(t.split(":")[0])) return "Local Anchor";
  return "Curiosity Gap";
}

// ─── Supabase REST ────────────────────────────────────────────────────────────

async function supabaseGet(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url.toString(), {
      signal: ctrl.signal,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error(`GET ${table} ${res.status}: ${await res.text()}`);
    return res.json();
  } finally { clearTimeout(t); }
}

async function supabasePost(table, body) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", signal: ctrl.signal,
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${table} ${res.status}: ${await res.text()}`);
  } finally { clearTimeout(t); }
}

// ─── Content Intelligence file ────────────────────────────────────────────────

const CI_GA4_START  = "<!-- cadence:ga4-start -->";
const CI_GA4_END    = "<!-- cadence:ga4-end -->";
const CI_SOCIAL_START  = "<!-- cadence:social-start -->";
const CI_SOCIAL_END    = "<!-- cadence:social-end -->";
const CI_LEADS_START   = "<!-- cadence:leads-start -->";
const CI_LEADS_END     = "<!-- cadence:leads-end -->";

function buildContentIntelligenceFile(post, meta) {
  const hook = classifyHook(post.title);
  const publishedDate = post.published_at
    ? post.published_at.split("T")[0]
    : new Date().toISOString().split("T")[0];

  const isEcosystem = !!meta.day;
  const categoryLine = isEcosystem
    ? `**Category:** ${meta.cat} — ${CATEGORY_FULL[meta.cat]}`
    : `**Category:** Standalone — ${(post.categories ?? []).join(", ") || "Uncategorized"}`;
  const modeLine = isEcosystem
    ? `**Emotional Mode:** ${meta.mode} — ${MODE_FULL[meta.mode]}`
    : `**Emotional Mode:** — (standalone post)`;
  const dayLine = isEcosystem ? `**Ecosystem Day:** ${meta.day} of 25` : "";

  const hookReason = {
    "Contrarian": "Challenges reader assumption — pattern interrupt that signals brand honesty",
    "Curiosity Gap": "Implies hidden or counterintuitive information that rewards reading",
    "Direct Answer": "Targets high-intent searchers looking for a specific answer",
    "Local Anchor": "Creates geographic specificity that increases local trust and SEO relevance",
  }[hook];

  return [
    `# ${post.title} — Intelligence Record`,
    `**Slug:** \`${post.slug}\``,
    `**Published:** ${publishedDate}`,
    categoryLine,
    modeLine,
    dayLine,
    `**Hook Type:** ${hook}`,
    `**Live URL:** ${BASE_URL}/${post.slug}`,
    "",
    "---",
    "",
    "## GA4 Performance",
    "",
    CI_GA4_START,
    "| Week | Sessions | Avg Time on Page | Organic Sessions | Notes |",
    "|------|----------|-----------------|-----------------|-------|",
    "| (awaiting first report) | — | — | — | |",
    CI_GA4_END,
    "",
    "## Social Performance",
    "",
    CI_SOCIAL_START,
    "| Platform | Post Date | Reach | Engagement | Rate | Caption Hook |",
    "|----------|-----------|-------|------------|------|-------------|",
    "| Facebook | — | — | — | — | |",
    "| Instagram | — | — | — | — | |",
    CI_SOCIAL_END,
    "",
    "## Lead Attribution",
    "",
    CI_LEADS_START,
    "| Date | Form Type | Quality Signal | Message Snippet |",
    "|------|-----------|---------------|----------------|",
    "| (none logged) | | | |",
    CI_LEADS_END,
    "",
    "## Hook Analysis",
    "",
    `**Hook format:** ${hook}`,
    `**Why chosen:** ${hookReason}`,
    "**Observed CTR signal:** *(from GA4 organic — populated after data available)*",
    "",
    "## Observations",
    "",
    "*Append observations here as performance data accumulates.*",
    "",
    "## Related Posts",
    "",
    "*Internal links to topically related posts in the ecosystem.*",
    "",
    "---",
    "",
    `*Intelligence record created by Cadence — ${new Date().toISOString().split("T")[0]}*`,
  ].filter(l => l !== undefined).join("\n");
}

// ─── Content Intelligence index ───────────────────────────────────────────────

const CI_INDEX_START = "<!-- cadence:ci-index-start -->";
const CI_INDEX_END   = "<!-- cadence:ci-index-end -->";

function updateContentIntelligenceIndex(newPosts) {
  const indexPath = join(CONTENT_DIR, "index.md");
  if (!existsSync(indexPath)) {
    const rows = newPosts.map(p => {
      const eco = ECOSYSTEM[p.slug];
      const cat = eco ? eco.cat : "—";
      const mode = eco ? eco.mode : "—";
      const day = eco ? eco.day : "—";
      const published = p.published_at ? p.published_at.split("T")[0] : "—";
      return `| ${day} | ${cat} | ${mode} | [[${p.slug}\\|${p.title.substring(0, 40)}]] | ${published} |`;
    }).join("\n");

    writeFileSync(indexPath, [
      "# Content Intelligence — Index",
      "**Maintained by:** Cadence Intelligence (`npm run sync:intelligence:process`)",
      "",
      "| Day | Cat | Mode | Post | Published |",
      "|-----|-----|------|------|----------|",
      CI_INDEX_START,
      rows,
      CI_INDEX_END,
      "",
      "*One file per published post. Open any file for per-post performance data.*",
    ].join("\n"), "utf8");
    return;
  }

  // Append new rows within markers
  const content = readFileSync(indexPath, "utf8");
  const section = getBetween(content, CI_INDEX_START, CI_INDEX_END);
  if (!section) return;

  const newRows = newPosts.map(p => {
    const eco = ECOSYSTEM[p.slug];
    const cat = eco ? eco.cat : "—";
    const mode = eco ? eco.mode : "—";
    const day = eco ? eco.day : "—";
    const published = p.published_at ? p.published_at.split("T")[0] : "—";
    return `| ${day} | ${cat} | ${mode} | [[${p.slug}\\|${p.title.substring(0, 40)}]] | ${published} |`;
  }).join("\n");

  const combined = [section.trim(), newRows].filter(Boolean).join("\n");
  writeFileSync(indexPath, replaceBetween(content, CI_INDEX_START, CI_INDEX_END, `\n${combined}\n`), "utf8");
}

// ─── Marker helpers ───────────────────────────────────────────────────────────

function getBetween(content, start, end) {
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) return null;
  return content.substring(s + start.length, e);
}

function replaceBetween(content, start, end, replacement) {
  const s = content.indexOf(start);
  const e = content.indexOf(end);
  if (s === -1 || e === -1) throw new Error(`Markers not found: ${start}`);
  return content.substring(0, s + start.length) + replacement + content.substring(e);
}

// ─── Event log ────────────────────────────────────────────────────────────────

function getEventLogPath(date) {
  return join(EVENT_LOG_DIR, `${date} Event Log.md`);
}

function ensureEventLog(date) {
  const path = getEventLogPath(date);
  if (existsSync(path)) return path;
  writeFileSync(path, [
    `# ${date} — Event Log`,
    "**Generated by:** Cadence Intelligence",
    "",
    "---",
    "",
    "## Events",
    "",
    "<!-- cadence:events-start -->",
    "<!-- cadence:events-end -->",
    "",
  ].join("\n"), "utf8");
  return path;
}

function appendToEventLog(date, lines) {
  const path = ensureEventLog(date);
  let content = readFileSync(path, "utf8");
  const section = getBetween(content, "<!-- cadence:events-start -->", "<!-- cadence:events-end -->");
  if (section === null) {
    appendFileSync(path, lines.join("\n") + "\n", "utf8");
    return;
  }
  const combined = [section.trim(), ...lines].filter(Boolean).join("\n");
  writeFileSync(path, replaceBetween(content, "<!-- cadence:events-start -->", "<!-- cadence:events-end -->", `\n${combined}\n`), "utf8");
}

function classifyEventLine(event) {
  const ts = event.timestamp ? event.timestamp.split("T")[0] : "?";
  const time = event.timestamp ? event.timestamp.split("T")[1]?.substring(0, 5) : "?";
  switch (event.type) {
    case "blog.published": {
      const slug = event.entity_id ?? event.metadata?.slug ?? "—";
      const eco = ECOSYSTEM[slug];
      const titleFromSummary = event.summary?.match(/"(.+?)"/)?.[1] ?? null;
      const hook = titleFromSummary ? classifyHook(titleFromSummary) : "—";
      return [
        `<!-- event:${event.id} -->`,
        `### blog.published — ${ts} ${time} UTC`,
        `- **Post:** ${event.summary ?? slug}`,
        `- **Slug:** \`${slug}\``,
        `- **Category:** ${eco ? eco.cat + " — " + CATEGORY_FULL[eco.cat] : "Standalone"}`,
        `- **Mode:** ${eco ? eco.mode + " — " + MODE_FULL[eco.mode] : "—"}`,
        `- **Hook type:** ${hook}`,
        `- **Intelligence file:** [[${slug}]]`,
        "",
      ].join("\n");
    }
    case "lead.received":
      return [
        `<!-- event:${event.id} -->`,
        `### lead.received — ${ts} ${time} UTC`,
        `- **Source:** Contact form`,
        `- **Attribution:** Pending — review which content brought this visitor`,
        `- **Action:** Update matching Content Intelligence file with lead attribution`,
        "",
      ].join("\n");
    case "partner.inquiry_received":
      return [
        `<!-- event:${event.id} -->`,
        `### partner.inquiry_received — ${ts} ${time} UTC`,
        `- **Source:** Partner form`,
        `- **Attribution:** Pending`,
        "",
      ].join("\n");
    case "cadence.blog_sync_completed":
      return [
        `<!-- event:${event.id} -->`,
        `### cadence.blog_sync_completed — ${ts} ${time} UTC`,
        `- **Posts synced:** ${event.metadata?.posts_updated ?? "?"}`,
        `- **Mode:** ${event.metadata?.mode ?? "?"}`,
        "",
      ].join("\n");
    default:
      return [
        `<!-- event:${event.id} -->`,
        `### ${event.type} — ${ts} ${time} UTC`,
        `- **Summary:** ${event.summary ?? "—"}`,
        "",
      ].join("\n");
  }
}

// ─── GA4 parsing ─────────────────────────────────────────────────────────────

/**
 * Parse a weekly analytics report markdown file and extract per-slug data.
 * Returns Map<slug, { sessions, avgTime, organic }>
 */
function parseGa4Report(reportContent) {
  const result = new Map();
  const lines = reportContent.split("\n");

  for (const line of lines) {
    // Look for lines with /blog/ paths and numeric data
    const blogMatch = line.match(/\/blog\/([a-z0-9-]+)/);
    if (!blogMatch) continue;
    const slug = blogMatch[1];

    // Extract numbers from the line (sessions, views, time, etc.)
    const nums = line.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (nums.length === 0) continue;

    // Heuristic: first number is pageviews/sessions, look for time patterns "X:XX" or "Xm Xs"
    const timeMatch = line.match(/(\d+)m\s*(\d+)s|(\d+):(\d+)/);
    let avgTime = "—";
    if (timeMatch) {
      if (timeMatch[1]) avgTime = `${timeMatch[1]}m ${timeMatch[2]}s`;
      else avgTime = `${timeMatch[3]}m ${timeMatch[4]}s`;
    }

    const sessions = nums[0] ?? "—";
    result.set(slug, { sessions, avgTime, organic: "—" });
  }

  return result;
}

/**
 * Append a GA4 data row to a Content Intelligence file.
 */
function updateContentIntelligenceGa4(slug, weekDate, data) {
  const filePath = join(CONTENT_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return false;

  const content = readFileSync(filePath, "utf8");
  const section = getBetween(content, CI_GA4_START, CI_GA4_END);
  if (section === null) return false;

  // Check if this week already exists (idempotent)
  if (section.includes(weekDate)) return false;

  const newRow = `| ${weekDate} | ${data.sessions} | ${data.avgTime} | ${data.organic} | |`;

  // Remove the placeholder if it's the only row
  let existingRows = section.trim();
  if (existingRows.includes("(awaiting first report)")) {
    existingRows = "| Week | Sessions | Avg Time on Page | Organic Sessions | Notes |\n|------|----------|-----------------|-----------------|-------|";
  }
  const combined = existingRows + "\n" + newRow;
  writeFileSync(filePath, replaceBetween(content, CI_GA4_START, CI_GA4_END, `\n${combined}\n`), "utf8");
  return true;
}

// ─── Tracking files ───────────────────────────────────────────────────────────

function ensureTrackingFiles(publishedPosts) {
  // Hook Performance
  const hookPath = join(TRACKING_DIR, "Hook Performance.md");
  if (!existsSync(hookPath)) {
    const counts = { "Contrarian": 0, "Curiosity Gap": 0, "Direct Answer": 0, "Local Anchor": 0 };
    for (const p of publishedPosts) counts[classifyHook(p.title)]++;

    writeFileSync(hookPath, [
      "# Hook Performance Tracker",
      "**Maintained by:** Cadence Intelligence",
      "**Updated:** " + new Date().toISOString().split("T")[0],
      "",
      "> Tracks performance by hook format across all published posts. Populated by Cadence weekly reports.",
      "",
      "| Hook Type | Posts | Avg Sessions | Avg Organic | Avg Social Reach | Avg Engagement Rate | Last Data |",
      "|-----------|-------|--------------|-------------|-----------------|-------------------|----------|",
      `| Curiosity Gap | ${counts["Curiosity Gap"]} | — | — | — | — | — |`,
      `| Direct Answer | ${counts["Direct Answer"]} | — | — | — | — | — |`,
      `| Contrarian | ${counts["Contrarian"]} | — | — | — | — | — |`,
      `| Local Anchor | ${counts["Local Anchor"]} | — | — | — | — | — |`,
      "",
      "## Posts by Hook Type",
      "",
    ].concat(
      publishedPosts.map(p => {
        const hook = classifyHook(p.title);
        return `- **${hook}:** [[${p.slug}|${p.title.substring(0, 45)}]]`;
      })
    ).concat([
      "",
      "*Run `npm run sync:intelligence:weekly` after each GA4 report to update averages.*",
    ]).join("\n"), "utf8");
    console.log("  ✓ Created Tracking/Hook Performance.md");
  }

  // Topic Performance
  const topicPath = join(TRACKING_DIR, "Topic Performance.md");
  if (!existsSync(topicPath)) {
    const catCounts = { PF: 0, HM: 0, SJ: 0, CF: 0, RR: 0, Standalone: 0 };
    for (const p of publishedPosts) {
      const eco = ECOSYSTEM[p.slug];
      if (eco) catCounts[eco.cat]++;
      else catCounts.Standalone++;
    }

    writeFileSync(topicPath, [
      "# Topic Performance Tracker",
      "**Maintained by:** Cadence Intelligence",
      "**Updated:** " + new Date().toISOString().split("T")[0],
      "",
      "| Category | Posts Live | Avg Sessions | Avg Organic | Lead Attributions | Best Post | Last Data |",
      "|----------|-----------|--------------|-------------|------------------|-----------|----------|",
      `| People-First (PF) | ${catCounts.PF} | — | — | — | — | — |`,
      `| Hidden Math (HM) | ${catCounts.HM} | — | — | — | — | — |`,
      `| South Jersey Pull (SJ) | ${catCounts.SJ} | — | — | — | — | — |`,
      `| Creative Finance (CF) | ${catCounts.CF} | — | — | — | — | — |`,
      `| REAL Rules (RR) | ${catCounts.RR} | — | — | — | — | — |`,
      `| Standalone | ${catCounts.Standalone} | — | — | — | — | — |`,
      "",
      "*Run `npm run sync:intelligence:weekly` after each GA4 report to update averages.*",
    ].join("\n"), "utf8");
    console.log("  ✓ Created Tracking/Topic Performance.md");
  }

  // Posting Time Analysis
  const timePath = join(TRACKING_DIR, "Posting Time Analysis.md");
  if (!existsSync(timePath)) {
    const rows = publishedPosts.map(p => {
      const date = p.published_at ? new Date(p.published_at) : null;
      const day = date ? ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][date.getDay()] : "—";
      const time = date ? date.toISOString().split("T")[1].substring(0, 5) + " UTC" : "—";
      const pub = p.published_at ? p.published_at.split("T")[0] : "—";
      return `| ${pub} | [[${p.slug}\\|${p.title.substring(0, 35)}]] | ${day} | ${time} | — | — |`;
    }).join("\n");

    writeFileSync(timePath, [
      "# Posting Time Analysis",
      "**Maintained by:** Cadence Intelligence",
      "",
      "> Tracks publish day and time against first-week performance. Requires ≥10 posts for pattern detection.",
      "",
      "| Published | Post | Day | Time | Wk1 Sessions | Notes |",
      "|-----------|------|-----|------|-------------|-------|",
      rows,
      "",
      "## Pattern Observations",
      "",
      "*(Requires ≥10 published posts and ≥4 weeks of data)*",
    ].join("\n"), "utf8");
    console.log("  ✓ Created Tracking/Posting Time Analysis.md");
  }

  // Engagement Patterns
  const patternPath = join(TRACKING_DIR, "Engagement Patterns.md");
  if (!existsSync(patternPath)) {
    writeFileSync(patternPath, [
      "# Engagement Pattern Observations",
      "**Maintained by:** Cadence Intelligence (manually reviewed)",
      "",
      "> Running qualitative observations about what's working. Updated after each weekly report.",
      "",
      "## Confirmed Patterns",
      "",
      "*(None confirmed yet — requires ≥4 weeks of data)*",
      "",
      "## Emerging Signals",
      "",
      "*(Populated after first GA4 weekly report with blog traffic)*",
      "",
      "## Open Questions",
      "",
      "- Which emotional mode (H/E/T/L/R) generates the most return visits?",
      "- Which hook format generates more organic CTR?",
      "- Does publish day affect social reach?",
      "- Which homeowner persona (PF/HM/SJ/CF/RR) engages most with content?",
      "- Are lead form submissions correlated with specific post categories?",
      "",
      "## Weekly Notes",
      "",
      "*(Append observations here after each weekly report — keep newest at top)*",
    ].join("\n"), "utf8");
    console.log("  ✓ Created Tracking/Engagement Patterns.md");
  }
}

// ─── Weekly intelligence report ───────────────────────────────────────────────

function generateWeeklyReport(publishedPosts, ga4Map, weekDate, eventSummary) {
  const today = new Date().toISOString().split("T")[0];
  const reportPath = join(WEEKLY_DIR, `${today} Weekly Intelligence Report.md`);

  if (existsSync(reportPath)) {
    console.log(`  [skip] Weekly report for ${today} already exists`);
    return;
  }

  // Build blog performance table
  const blogRows = publishedPosts.map(p => {
    const d = ga4Map.get(p.slug);
    const sessions = d?.sessions ?? "—";
    const avgTime  = d?.avgTime  ?? "—";
    const organic  = d?.organic  ?? "—";
    const eco = ECOSYSTEM[p.slug];
    const cat = eco ? eco.cat : "—";
    const hook = classifyHook(p.title);
    return `| [[${p.slug}\\|${p.title.substring(0, 35)}]] | ${cat} | ${hook} | ${sessions} | ${avgTime} | ${organic} |`;
  }).join("\n");

  writeFileSync(reportPath, [
    `# ${today} Weekly Intelligence Report`,
    `**Generated by:** Cadence Intelligence — \`npm run sync:intelligence:weekly\``,
    `**GA4 report period:** ${weekDate ?? "latest"}`,
    `**Published posts monitored:** ${publishedPosts.length}`,
    "",
    "---",
    "",
    "## Blog Performance",
    "",
    "| Post | Cat | Hook | Sessions | Avg Time | Organic |",
    "|------|-----|------|----------|----------|---------|",
    blogRows || "| (no data yet) | | | | | |",
    "",
    "## Lead Activity",
    "",
    `- Contact form submissions: ${eventSummary.leads}`,
    `- Partner inquiries: ${eventSummary.partners}`,
    "- Attribution: Review lead messages against recent published posts",
    "",
    "## Hook Performance Update",
    "",
    "*(Update Hook Performance.md manually or after ≥5 posts per hook type)*",
    "",
    "## Topic Performance Update",
    "",
    "*(Update Topic Performance.md after sufficient data per category)*",
    "",
    "## Emerging Patterns",
    "",
    "*(Add observations here — what content performed above or below baseline?)*",
    "",
    "## Recommendations Queued",
    "",
    "*(Add items to Cadence Logs/Deferred Recommendations.md if actionable)*",
    "",
    "---",
    "",
    `*Generated: ${today} | Source: GA4 weekly report + cadence_events + Cadence Intelligence*`,
  ].join("\n"), "utf8");

  console.log(`  ✓ Weekly Intelligence Report: ${today} Weekly Intelligence Report.md`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n[intelligence] ─────────────────────────────────────────`);
  console.log(`[intelligence] Mode:  ${MODE.toUpperCase()}`);
  console.log(`[intelligence] Vault: ${VAULT}`);
  console.log(`[intelligence] ─────────────────────────────────────────`);

  // 1. Fetch published posts
  console.log("\n[intelligence] Fetching published posts from Supabase…");
  let publishedPosts;
  try {
    publishedPosts = await supabaseGet("blog_posts", {
      status: "eq.published",
      select: "slug,title,published_at,categories,tags",
      order: "published_at.asc",
    });
  } catch (err) {
    console.error(`[intelligence] Supabase fetch failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`[intelligence] ${publishedPosts.length} published post(s)`);

  // 2. Check which posts need Content Intelligence files
  mkdirSync(CONTENT_DIR, { recursive: true });
  mkdirSync(TRACKING_DIR, { recursive: true });
  mkdirSync(WEEKLY_DIR, { recursive: true });
  mkdirSync(EVENT_LOG_DIR, { recursive: true });

  const pending = publishedPosts.filter(p => !existsSync(join(CONTENT_DIR, `${p.slug}.md`)));
  const existing = publishedPosts.filter(p =>  existsSync(join(CONTENT_DIR, `${p.slug}.md`)));

  console.log(`[intelligence] Content Intelligence files:`);
  console.log(`  Existing: ${existing.length}`);
  console.log(`  To create: ${pending.length}`);
  if (pending.length > 0) {
    for (const p of pending) {
      const eco = ECOSYSTEM[p.slug];
      console.log(`  → ${p.slug}`);
      console.log(`    Hook: ${classifyHook(p.title)} | Cat: ${eco?.cat ?? "Standalone"} | Mode: ${eco?.mode ?? "—"}`);
    }
  }

  // 3. Fetch recent cadence_events
  let events = [];
  try {
    events = await supabaseGet("cadence_events", {
      order: "timestamp.desc",
      limit: "50",
      select: "id,type,timestamp,source,summary,entity_id,entity_type,metadata,importance",
    });
  } catch (err) {
    console.log(`  [warn] Could not fetch cadence_events: ${err.message}`);
  }

  const today = new Date().toISOString().split("T")[0];
  const newEvents = events.filter(e => {
    const date = e.timestamp ? e.timestamp.split("T")[0] : today;
    const logPath = getEventLogPath(date);
    if (!existsSync(logPath)) return true;
    const content = readFileSync(logPath, "utf8");
    return !content.includes(e.id ?? e.timestamp);
  });
  console.log(`[intelligence] cadence_events to log: ${newEvents.length}`);

  if (MODE === "observe") {
    console.log(`\n[intelligence] Done (observe mode — no writes)\n`);
    return;
  }

  // ─── PROCESS MODE ──────────────────────────────────────────────────────────

  // 4. Create pending Content Intelligence files
  if (pending.length > 0) {
    console.log(`\n[intelligence] Creating Content Intelligence files…`);
    const newlyCreated = [];
    for (const post of pending) {
      const eco = ECOSYSTEM[post.slug] ?? {};
      const content = buildContentIntelligenceFile(post, eco);
      writeFileSync(join(CONTENT_DIR, `${post.slug}.md`), content, "utf8");
      console.log(`  ✓ ${post.slug}.md`);
      newlyCreated.push(post);
    }
    updateContentIntelligenceIndex(newlyCreated);
    console.log(`  ✓ Content Intelligence index updated`);
  }

  // 5. Create/update tracking files
  console.log(`\n[intelligence] Checking tracking files…`);
  ensureTrackingFiles(publishedPosts);

  // 6. Log new events to Event Log
  if (newEvents.length > 0) {
    console.log(`\n[intelligence] Logging ${newEvents.length} event(s) to Event Log…`);
    const byDate = {};
    for (const event of newEvents) {
      const date = event.timestamp ? event.timestamp.split("T")[0] : today;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(event);
    }
    for (const [date, dateEvents] of Object.entries(byDate)) {
      const lines = dateEvents.map(e => classifyEventLine(e));
      appendToEventLog(date, lines);
      console.log(`  ✓ Event Log ${date} — ${dateEvents.length} event(s)`);
    }
  }

  // ─── WEEKLY MODE ───────────────────────────────────────────────────────────

  if (MODE === "weekly") {
    console.log(`\n[intelligence] Weekly report mode…`);

    // Find latest GA4 report
    let ga4Map = new Map();
    let weekDate = null;
    if (existsSync(ANALYTICS_DIR)) {
      const reports = readdirSync(ANALYTICS_DIR)
        .filter(f => f.endsWith(".md"))
        .sort()
        .reverse();

      if (reports.length > 0) {
        const latestReport = reports[0];
        weekDate = latestReport.replace(" Weekly Analytics Report.md", "");
        const reportContent = readFileSync(join(ANALYTICS_DIR, latestReport), "utf8");
        ga4Map = parseGa4Report(reportContent);
        console.log(`  Found GA4 report: ${latestReport}`);
        console.log(`  Blog data found for ${ga4Map.size} slug(s)`);

        // Update Content Intelligence GA4 sections
        let updated = 0;
        for (const [slug, data] of ga4Map.entries()) {
          if (updateContentIntelligenceGa4(slug, weekDate, data)) updated++;
        }
        console.log(`  ✓ Updated GA4 sections in ${updated} Content Intelligence file(s)`);
      } else {
        console.log("  [warn] No GA4 reports found in Analytics/Weekly Reports/");
      }
    }

    // Count lead events for this week's report
    const leadEvents = events.filter(e => e.type === "lead.received");
    const partnerEvents = events.filter(e => e.type === "partner.inquiry_received");

    generateWeeklyReport(publishedPosts, ga4Map, weekDate, {
      leads: leadEvents.length,
      partners: partnerEvents.length,
    });
  }

  // 7. Log Cadence intelligence event
  if (pending.length > 0 || newEvents.length > 0) {
    try {
      await supabasePost("cadence_events", {
        type: "cadence.intelligence_processed",
        source: "intelligence-script",
        importance: "normal",
        metadata: {
          mode: MODE,
          files_created: pending.length,
          events_logged: newEvents.length,
        },
      });
    } catch { /* non-fatal */ }
  }

  // 8. Ensure Intelligence index exists
  const intelIndexPath = join(INTEL_DIR, "index.md");
  if (!existsSync(intelIndexPath)) {
    writeFileSync(intelIndexPath, [
      "# Intelligence — Index",
      "**Purpose:** Cadence Event-Driven Intelligence System for Island Investors NJ",
      "**Maintained by:** Cadence Intelligence (`npm run sync:intelligence:process`)",
      "",
      "---",
      "",
      "## Navigation",
      "",
      "| Section | Purpose |",
      "|---------|---------|",
      "| [[Content Intelligence/index\\|Content Intelligence/]] | Per-post performance records |",
      "| [[Tracking/Hook Performance\\|Tracking/Hook Performance]] | Hook type → performance aggregate |",
      "| [[Tracking/Topic Performance\\|Tracking/Topic Performance]] | Category → performance aggregate |",
      "| [[Tracking/Posting Time Analysis\\|Tracking/Posting Time Analysis]] | Publish timing → performance |",
      "| [[Tracking/Engagement Patterns\\|Tracking/Engagement Patterns]] | Qualitative pattern observations |",
      "| [[Weekly Intelligence/index\\|Weekly Intelligence/]] | Synthesized weekly reports |",
      "| [[Event Log/index\\|Event Log/]] | Daily classified operational events |",
      "",
      "## Quick Commands",
      "",
      "```bash",
      "npm run sync:intelligence           # Observe — show pending work",
      "npm run sync:intelligence:process   # Process — create files, log events",
      "npm run sync:intelligence:weekly    # Weekly — parse GA4, generate report",
      "```",
      "",
      "## Governing Framework",
      "",
      "- Intelligence model: [[HQ Core/FEEDBACK_ENGINE]]",
      "- Priority: [[HQ Core/PRIORITY_STACK]] (Tier 2 — Retrieval Accuracy drives structure)",
      "- Module docs: See HQ Framework vault → `Systems/Intelligence Module.md`",
      "",
      "---",
      "",
      `*Intelligence system initialized: ${new Date().toISOString().split("T")[0]}*`,
    ].join("\n"), "utf8");
    console.log("\n  ✓ Created Intelligence/index.md");
  }

  // Event Log index
  const elIndexPath = join(EVENT_LOG_DIR, "index.md");
  if (!existsSync(elIndexPath)) {
    writeFileSync(elIndexPath, [
      "# Event Log — Index",
      "",
      "Daily classified operational event logs.",
      "",
      "**Format:** `[YYYY-MM-DD] Event Log.md`",
      "",
      "*Newest entries at top.*",
    ].join("\n"), "utf8");
  }

  // Weekly index
  const wkIndexPath = join(WEEKLY_DIR, "index.md");
  if (!existsSync(wkIndexPath)) {
    writeFileSync(wkIndexPath, [
      "# Weekly Intelligence — Index",
      "",
      "Synthesized weekly operational intelligence reports.",
      "",
      "**Generated by:** `npm run sync:intelligence:weekly`",
      "**Trigger:** After each Sunday GA4 report arrives",
      "",
      "*Newest entries at top.*",
    ].join("\n"), "utf8");
  }

  console.log(`\n[intelligence] ✓ Done — mode: ${MODE}\n`);
}

main().catch(err => {
  console.error("[intelligence] Fatal:", err);
  process.exit(1);
});
