import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLeadNotification } from "@/lib/push";
import { logEvent } from "@/lib/cadence";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "johnnyr5458@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "forms@islandinvestorsnj.com";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    const text = await req.text();
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = JSON.parse(text);
    } else {
      body = Object.fromEntries(new URLSearchParams(text));
    }
  } catch (err) {
    console.error("[contact] Failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot — bots fill in hidden fields, humans don't
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { address, name, phone, bestTime, message } = body;

  if (!address || !name || !phone) {
    console.warn("[contact] Missing required fields:", { address, name, phone });
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  // 1. Insert into Supabase first — this is the source of truth
  const admin = createAdminClient();
  const { error: dbError } = await admin.from("contact_submissions").insert({
    name:        name.trim(),
    phone:       phone.trim(),
    address:     address.trim(),
    email:       body.email?.trim() || null,
    best_time:   bestTime?.trim() || null,
    message:     message?.trim() || null,
    form_type:   "seller",
    lead_source: "website",
    status:      "new",
    raw_payload: body,
  });

  if (dbError) {
    console.error("[contact] Supabase insert error:", dbError.message);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  console.log("[contact] Lead saved. Name:", name, "| Address:", address);

  // Cadence event — fire-and-forget
  logEvent({
    type: "lead.received",
    source: "leads",
    summary: `New seller lead: ${name} — ${address}`,
    entityType: "contact_submission",
    importance: "high",
  });

  // 2. Push notification — fire-and-forget
  void (async () => {
    try {
      const short = address.length > 30 ? address.slice(0, 27) + "…" : address;
      await sendLeadNotification("New Seller Lead", `${name} — ${short}`, "/hq/dashboard/leads");
    } catch (err) { console.error("[contact] Push notification failed:", err); }
  })();

  // 3. Send email notification — fire-and-forget, never blocks the response
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    void (async () => {
      try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from:    `Island Investors NJ <${FROM_EMAIL}>`,
          to:      [TO_EMAIL],
          replyTo: name && body.email ? `${name} <${body.email}>` : undefined,
          subject: `New Seller Lead: ${address}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#0a2240;margin-bottom:4px;">New Seller Lead</h2>
              <p style="color:#666;font-size:13px;margin-top:0;">Submitted via IslandInvestorsNJ.com contact form</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#6b7280;width:140px;vertical-align:top;font-weight:600;">Property Address</td><td style="padding:8px 0;color:#111827;">${address}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;font-weight:600;">Name</td><td style="padding:8px 0;color:#111827;">${name}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;font-weight:600;">Phone</td><td style="padding:8px 0;color:#111827;">${phone}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;font-weight:600;">Best Time to Call</td><td style="padding:8px 0;color:#111827;">${bestTime || "Not specified"}</td></tr>
                ${message ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;font-weight:600;">Situation</td><td style="padding:8px 0;color:#111827;">${message}</td></tr>` : ""}
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="font-size:12px;color:#9ca3af;">Submitted at ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>
            </div>
          `,
        });
        console.log("[contact] Email notification sent to:", TO_EMAIL);
      } catch (err) {
        console.error("[contact] Email send failed (non-fatal):", err);
      }
    })();
  } else {
    console.warn("[contact] RESEND_API_KEY not set — skipping email notification");
  }

  return NextResponse.json({ ok: true });
}
