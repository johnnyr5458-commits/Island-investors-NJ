import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { logEvent } from "@/lib/cadence";

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  let authorized = false;
  try {
    const secretBuf = Buffer.from(secret, "utf-8");
    const tokenBuf  = Buffer.from(token, "utf-8");
    authorized = secretBuf.length === tokenBuf.length && timingSafeEqual(secretBuf, tokenBuf);
  } catch {
    authorized = false;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type    = typeof body.type === "string"    ? body.type.trim()    : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";

  if (!type || !summary) {
    return NextResponse.json(
      { error: "Missing required fields: type, summary" },
      { status: 400 },
    );
  }

  const importance = body.importance === "high" ? "high" : "normal";

  // ── Log to Cadence ───────────────────────────────────────────────────────────
  try {
    logEvent({
      type,
      summary,
      actor:      typeof body.actor      === "string" ? body.actor      : "operator",
      source:     "webhook",
      entityType: typeof body.entityType === "string" ? body.entityType : undefined,
      entityId:   typeof body.entityId   === "string" ? body.entityId   : undefined,
      importance,
      metadata:   body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? body.metadata as Record<string, unknown>
        : undefined,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, logged: true });
}
