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
    console.error("[partner] Failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot — bots fill in hidden fields, humans don't
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const { name, company, email, phone, areas, property_types, funding, volume, notes } = body;

  if (!name || !email || !phone || !funding) {
    console.warn("[partner] Missing required fields:", { name, email, phone, funding });
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  // 1. Insert into Supabase first — this is the source of truth
  const admin = createAdminClient();
  const { error: dbError } = await admin.from("partner_submissions").insert({
    name:           name.trim(),
    email:          email.trim(),
    phone:          phone.trim(),
    company:        company?.trim() || null,
    areas:          areas?.trim() || null,
    property_types: property_types?.trim() || null,
    funding:        funding.trim(),
    volume:         volume?.trim() || null,
    notes:          notes?.trim() || null,
    form_type:      "partner",
    lead_source:    "website",
    status:         "new",
    raw_payload:    body,
  });

  if (dbError) {
    console.error("[partner] Supabase insert error:", dbError.message);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  console.log("[partner] Lead saved. Name:", name, "| Email:", email);

  // Cadence event — fire-and-forget
  logEvent({
    type: "partner.inquiry_received",
    source: "partners",
    summary: `New partner inquiry: ${name}${company ? ` — ${company}` : ""}`,
    entityType: "partner_submission",
    importance: "normal",
  });

  // 2. Push notification — fire-and-forget
  void (async () => {
    try {
      const label = company ? `${name} — ${company}` : name;
      await sendLeadNotification("New Partner Inquiry", label, "/hq/dashboard/partners/inquiries");
    } catch (err) { console.error("[partner] Push notification failed:", err); }
  })();

  // 3. Send email notification — fire-and-forget, never blocks the response
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    void (async () => {
      try {
        const resend = new Resend(apiKey);
        const row = (label: string, value: string | undefined, isEmail = false) => {
          const display = value?.trim() || "—";
          const cell = isEmail && value?.trim()
            ? `<a href="mailto:${value.trim()}" style="color:#b8860b;">${value.trim()}</a>`
            : `<span style="white-space:pre-wrap;">${display}</span>`;
          return `<tr>
            <td style="padding:8px 0;color:#6b7280;width:180px;vertical-align:top;font-weight:600;">${label}</td>
            <td style="padding:8px 0;color:${display === "—" ? "#9ca3af" : "#111827"};">${cell}</td>
          </tr>`;
        };
        await resend.emails.send({
          from:    `Island Investors NJ <${FROM_EMAIL}>`,
          to:      [TO_EMAIL],
          replyTo: `${name} <${email}>`,
          subject: `New Partner Inquiry: ${name}${company ? ` — ${company}` : ""}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
              <h2 style="color:#0a2240;margin-bottom:4px;">New Partner Inquiry</h2>
              <p style="color:#666;font-size:13px;margin-top:0;">Submitted via IslandInvestorsNJ.com — Partner With Us form</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                ${row("Name", name)}
                ${row("Company", company)}
                ${row("Email", email, true)}
                ${row("Phone", phone)}
                ${row("Investment Areas", areas)}
                ${row("Property Types", property_types)}
                ${row("Funding Type", funding)}
                ${row("Monthly Deal Volume", volume ? `${volume} properties` : undefined)}
                ${row("Notes", notes)}
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
              <p style="font-size:12px;color:#9ca3af;">Submitted at ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>
            </div>
          `,
        });
        console.log("[partner] Email notification sent to:", TO_EMAIL);
      } catch (err) {
        console.error("[partner] Email send failed (non-fatal):", err);
      }
    })();
  } else {
    console.warn("[partner] RESEND_API_KEY not set — skipping email notification");
  }

  return NextResponse.json({ ok: true });
}
