import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";

function getWebPush() {
  const pub   = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv  = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL ?? "johnnyr5458@gmail.com";
  if (!pub || !priv) return null;
  webpush.setVapidDetails(`mailto:${email}`, pub, priv);
  return webpush;
}

export async function sendLeadNotification(title: string, body: string, url: string) {
  const wp = getWebPush();
  if (!wp) {
    console.warn("[push] VAPID keys not configured — skipping notification");
    return;
  }

  const admin = createAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth_key");

  if (!subs?.length) return;

  await Promise.allSettled(
    subs.map(sub =>
      wp.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        JSON.stringify({ title, body, url })
      ).catch(async (err: { statusCode?: number }) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await admin.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          console.log("[push] Removed expired subscription:", sub.endpoint.slice(-20));
        } else {
          console.error("[push] Send failed:", err.statusCode, sub.endpoint.slice(-20));
        }
      })
    )
  );

  console.log("[push] Sent to", subs.length, "subscription(s):", title);
}
