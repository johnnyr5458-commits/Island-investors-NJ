import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Signature verification — skip only if secret not yet configured
  const secret = process.env.FORMSPREE_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("X-Formspree-Signature") ?? "";
    const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuf  = Buffer.from(sig,      "hex");
    const compBuf = Buffer.from(computed, "hex");
    const valid = sigBuf.length === compBuf.length && crypto.timingSafeEqual(sigBuf, compBuf);
    if (!valid) {
      console.warn("[webhook/formspree] Invalid signature — rejecting request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[webhook/formspree] FORMSPREE_WEBHOOK_SECRET not set — skipping signature check (dev only)");
  }

  // 2. Parse JSON payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[webhook/formspree] Could not parse JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[webhook/formspree] Received payload keys:", Object.keys(payload));

  // 3. Detect form type — explicit field first, then field-presence fallback
  const formType =
    typeof payload.form_type === "string"
      ? payload.form_type
      : payload.address
      ? "seller"
      : payload.funding
      ? "partner"
      : "unknown";

  const admin = createAdminClient();

  // 4a. Seller lead → contact_submissions
  if (formType === "seller") {
    const phone   = String(payload.phone   ?? "").trim();
    const address = String(payload.address ?? "").trim();

    if (!phone && !address) {
      console.warn("[webhook/formspree] Seller payload missing phone and address — skipping");
      return NextResponse.json({ ok: true, skipped: "missing_fields" });
    }

    // Duplicate check by phone OR address
    const orFilter = [
      phone   ? `phone.eq.${phone}`     : null,
      address ? `address.ilike.${address}` : null,
    ].filter(Boolean).join(",");

    const { data: existing } = await admin
      .from("contact_submissions")
      .select("id")
      .or(orFilter)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("[webhook/formspree] Duplicate seller lead — skipping insert. Existing ID:", existing[0].id);
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await admin.from("contact_submissions").insert({
      name:        String(payload.name     ?? "").trim() || "Unknown",
      phone,
      address,
      email:       String(payload.email    ?? "").trim() || null,
      best_time:   String(payload.bestTime ?? "").trim() || null,
      message:     String(payload.message  ?? "").trim() || null,
      form_type:   "seller",
      lead_source: "formspree",
      status:      "new",
      raw_payload: payload,
    });

    if (error) {
      console.error("[webhook/formspree] Supabase insert error (seller):", error.message);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    console.log("[webhook/formspree] Seller lead inserted. Name:", payload.name, "| Address:", address);
    return NextResponse.json({ ok: true });
  }

  // 4b. Partner lead → partner_submissions
  if (formType === "partner") {
    const email = String(payload.email ?? "").trim();
    const phone = String(payload.phone ?? "").trim();

    if (!email && !phone) {
      console.warn("[webhook/formspree] Partner payload missing email and phone — skipping");
      return NextResponse.json({ ok: true, skipped: "missing_fields" });
    }

    // Duplicate check by email OR phone
    const orFilter = [
      email ? `email.eq.${email}` : null,
      phone ? `phone.eq.${phone}` : null,
    ].filter(Boolean).join(",");

    const { data: existing } = await admin
      .from("partner_submissions")
      .select("id")
      .or(orFilter)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("[webhook/formspree] Duplicate partner lead — skipping insert. Existing ID:", existing[0].id);
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await admin.from("partner_submissions").insert({
      name:           String(payload.name           ?? "").trim() || "Unknown",
      email,
      phone,
      company:        String(payload.company        ?? "").trim() || null,
      areas:          String(payload.areas          ?? "").trim() || null,
      property_types: String(payload.property_types ?? "").trim() || null,
      funding:        String(payload.funding        ?? "").trim() || null,
      volume:         String(payload.volume         ?? "").trim() || null,
      notes:          String(payload.notes          ?? "").trim() || null,
      form_type:      "partner",
      lead_source:    "formspree",
      status:         "new",
      raw_payload:    payload,
    });

    if (error) {
      console.error("[webhook/formspree] Supabase insert error (partner):", error.message);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    console.log("[webhook/formspree] Partner lead inserted. Name:", payload.name, "| Email:", email);
    return NextResponse.json({ ok: true });
  }

  // 4c. Unknown form type — log and ignore gracefully
  console.warn("[webhook/formspree] Unknown form_type:", formType, "| Keys:", Object.keys(payload));
  return NextResponse.json({ ok: true, unknown_type: formType });
}
