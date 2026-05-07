import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "johnnyr5458@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "forms@islandinvestorsnj.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[partner] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

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

  const { name, company, email, phone, areas, property_types, funding, volume, notes } = body;

  if (!name || !email || !phone || !funding) {
    console.warn("[partner] Missing required fields:", { name, email, phone, funding });
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

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

  const emailHtml = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `Island Investors NJ <${FROM_EMAIL}>`,
      to: [TO_EMAIL],
      replyTo: `${name} <${email}>`,
      subject: `New Partner Inquiry: ${name}${company ? ` — ${company}` : ""}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[partner] Resend API error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    console.log("[partner] Email sent successfully. ID:", data?.id, "| To:", TO_EMAIL, "| From:", name, email);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[partner] Unexpected error sending email:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
