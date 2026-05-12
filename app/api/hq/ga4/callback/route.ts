import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/ga4";

// This route is called by Google after the user approves OAuth access.
// It exchanges the authorization code for tokens and displays the refresh token
// so the admin can save it to environment variables.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(errorPage(error), { headers: { "Content-Type": "text/html" } });
  }

  if (!code) {
    return new NextResponse(errorPage("No authorization code received."), {
      headers: { "Content-Type": "text/html" },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/hq/ga4/callback`;
  const result = await exchangeCodeForTokens(code, redirectUri);

  if (!result.refresh_token) {
    return new NextResponse(
      errorPage(result.error ?? "Token exchange failed — no refresh token returned. Make sure 'offline' access type was requested."),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(successPage(result.refresh_token, siteUrl), {
    headers: { "Content-Type": "text/html" },
  });
}

function successPage(refreshToken: string, siteUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GA4 Connected — Island Investors HQ</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060E1A; color: #f0ead8; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: rgba(8,22,40,0.80); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 32px; max-width: 600px; width: 100%; position: relative; }
    .card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(200,150,42,0.5) 50%, transparent); }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(52,211,153,0.12); border: 1px solid rgba(52,211,153,0.3); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #34d399; margin-bottom: 20px; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; }
    h1 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    p { font-size: 13px; color: rgba(192,182,158,0.84); line-height: 1.6; margin-bottom: 16px; }
    .token-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(215,168,58,0.92); margin-bottom: 8px; }
    .token-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(200,150,42,0.25); border-radius: 4px; padding: 12px 14px; font-family: monospace; font-size: 12px; color: #f0ead8; word-break: break-all; margin-bottom: 20px; position: relative; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: rgba(200,150,42,0.15); border: 1px solid rgba(200,150,42,0.3); color: rgba(215,168,58,0.92); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
    .steps { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; padding: 16px; margin-bottom: 20px; }
    .step { display: flex; gap: 10px; margin-bottom: 10px; font-size: 12px; color: rgba(192,182,158,0.84); line-height: 1.5; }
    .step:last-child { margin-bottom: 0; }
    .step-num { width: 18px; height: 18px; border-radius: 50%; background: rgba(200,150,42,0.15); border: 1px solid rgba(200,150,42,0.3); color: rgba(215,168,58,0.92); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    code { background: rgba(255,255,255,0.06); padding: 1px 5px; border-radius: 3px; font-family: monospace; font-size: 11px; color: rgba(215,168,58,0.92); }
    a.back { display: inline-block; margin-top: 4px; background: rgba(200,150,42,0.12); border: 1px solid rgba(200,150,42,0.28); color: rgba(215,168,58,0.92); padding: 10px 20px; border-radius: 4px; font-size: 12px; font-weight: 700; text-decoration: none; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><div class="dot"></div> GA4 Authorized</div>
    <h1>Google Analytics Connected</h1>
    <p>Authorization successful. Copy the refresh token below and save it to your environment variables — this activates the live analytics dashboard.</p>

    <div class="token-label">GA4_REFRESH_TOKEN</div>
    <div class="token-box" id="token">${refreshToken}<button class="copy-btn" onclick="navigator.clipboard.writeText('${refreshToken}');this.textContent='Copied'">Copy</button></div>

    <div class="steps">
      <div class="step"><div class="step-num">1</div><div>Copy the token above</div></div>
      <div class="step"><div class="step-num">2</div><div>Go to <strong>Vercel Dashboard → Your Project → Settings → Environment Variables</strong></div></div>
      <div class="step"><div class="step-num">3</div><div>Add <code>GA4_REFRESH_TOKEN</code> = the token above</div></div>
      <div class="step"><div class="step-num">4</div><div>Also add <code>GA4_PROPERTY_ID</code> = your numeric GA4 property ID (found in GA4 Admin → Property Settings)</div></div>
      <div class="step"><div class="step-num">5</div><div>Redeploy — all analytics charts will activate automatically</div></div>
    </div>

    <a class="back" href="${siteUrl}/hq/dashboard/analytics">← Back to Analytics</a>
  </div>
  <script>
    // Auto-select token text on click for easier copy
    document.getElementById('token').addEventListener('click', function() {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this);
      sel.removeAllRanges();
      sel.addRange(range);
    });
  </script>
</body>
</html>`;
}

function errorPage(message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GA4 Setup Error — Island Investors HQ</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060E1A; color: #f0ead8; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { background: rgba(8,22,40,0.80); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; padding: 32px; max-width: 500px; width: 100%; }
    h1 { font-size: 20px; font-weight: 700; color: #f87171; margin-bottom: 12px; }
    p { font-size: 13px; color: rgba(192,182,158,0.84); line-height: 1.6; margin-bottom: 20px; }
    a { color: rgba(215,168,58,0.92); text-decoration: underline; font-size: 13px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>GA4 Setup Error</h1>
    <p>${message}</p>
    <a href="/hq/dashboard/analytics">← Back to Analytics</a>
  </div>
</body>
</html>`;
}
