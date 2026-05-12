import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "johnnyr5458@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "forms@islandinvestorsnj.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  let body: Record<string, string>;
  try {
    const text = await req.text();
    // Support both JSON and form-encoded bodies
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = JSON.parse(text);
    } else {
      body = Object.fromEntries(new URLSearchParams(text));
    }
  } catch (err) {
    console.error("[contact] Failed to parse request body:", err);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { address, name, phone, bestTime, message } = body;

  if (!address || !name || !phone) {
    console.warn("[contact] Missing required fields:", { address, name, phone });
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  const resend = new Resend(apiKey);

  const emailHtml = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Island Investors NJ <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      replyTo: name && body.email ? `${name} <${body.email}>` : undefined,
      subject: `New Seller Lead: ${address}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[contact] Resend API error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log("[contact] Email sent successfully. ID:", data?.id, "| To:", TO_EMAIL, "| Address:", address);
    void (async () => {
      try {
        await createAdminClient().from("contact_submissions").insert({ name, phone, address, message });
      } catch {}
    })();
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[contact] Unexpected error sending email:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
