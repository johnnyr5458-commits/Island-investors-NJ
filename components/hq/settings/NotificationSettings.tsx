"use client";

import { useState, useEffect } from "react";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

function sanitizeVapidKey(raw: string | undefined): string {
  const charCodes = (s: string, n = 6) =>
    [...s].slice(0, n).map(c => c.charCodeAt(0));

  // DEBUG — log raw value before any processing
  console.log("[push:debug] raw value:      ", JSON.stringify(raw));
  console.log("[push:debug] raw length:     ", raw?.length ?? "undefined");
  if (raw) {
    console.log("[push:debug] raw char codes [0..5]:", charCodes(raw));
    console.log("[push:debug] contains double-quote:", raw.includes('"'));
    console.log("[push:debug] contains single-quote:", raw.includes("'"));
    console.log("[push:debug] contains backtick:    ", raw.includes("`"));
    console.log("[push:debug] contains space:       ", raw.includes(" "));
    console.log("[push:debug] contains newline:     ", raw.includes("\n"));
    console.log("[push:debug] contains CR:          ", raw.includes("\r"));
    console.log("[push:debug] contains tab:         ", raw.includes("\t"));
    // Scan for any non-printable or non-ASCII char
    const hidden = [...raw].filter(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126);
    console.log("[push:debug] hidden/non-ASCII chars:", hidden.map(c => c.charCodeAt(0)));
  }

  if (!raw) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");

  // Strip wrapping quotes (any combination of " ' `) then all whitespace
  const sanitized = raw
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, "");

  // DEBUG — log sanitized value
  console.log("[push:debug] sanitized value:", JSON.stringify(sanitized));
  console.log("[push:debug] sanitized length:", sanitized.length);
  console.log("[push:debug] sanitized char codes [0..5]:", charCodes(sanitized));

  if (sanitized.length !== 87) {
    throw new Error(`Invalid VAPID public key length: ${sanitized.length} (expected 87)`);
  }

  return sanitized;
}

function urlBase64ToUint8Array(sanitizedKey: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (sanitizedKey.length % 4)) % 4);
  const base64 = (sanitizedKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  console.log("[push:debug] base64 for atob (first 20):", base64.slice(0, 20));
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  console.log("[push:debug] Uint8Array length:", bytes.length, "first byte:", bytes[0]);
  return bytes;
}

type PermState = "loading" | "unsupported" | "default" | "granted" | "denied";

export default function NotificationSettings() {
  const [perm, setPerm]           = useState<PermState>("loading");
  const [subscribed, setSubscribed] = useState(false);
  const [working, setWorking]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission as PermState);
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    ).catch(() => {});
  }, []);

  async function enable() {
    setWorking(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      setPerm(permission as PermState);
      if (permission !== "granted") { setWorking(false); return; }

      const sanitizedKey = sanitizeVapidKey(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      const converted = urlBase64ToUint8Array(sanitizedKey);

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: converted,
      });

      const res = await fetch("/api/hq/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) throw new Error("Failed to save subscription");
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWorking(false);
    }
  }

  async function disable() {
    setWorking(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/hq/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWorking(false);
    }
  }

  if (perm === "loading") return (
    <p className="font-sans text-xs" style={{ color: HQ_TEXT.helper }}>Checking status…</p>
  );

  if (perm === "unsupported") return (
    <p className="font-sans text-xs" style={{ color: HQ_TEXT.muted }}>
      Push notifications are not supported in this browser.
    </p>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-sm font-semibold" style={{ color: HQ_TEXT.secondary }}>
            Lead Alerts
          </p>
          <p className="font-sans text-xs mt-0.5" style={{ color: HQ_TEXT.muted }}>
            Get notified instantly when a new seller lead or partner inquiry comes in.
          </p>
        </div>

        {perm === "denied" ? (
          <span
            className="font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
            style={{ background: "rgba(148,163,184,0.08)", color: "#94a3b8" }}
          >
            Blocked
          </span>
        ) : subscribed ? (
          <button
            onClick={disable}
            disabled={working}
            className="font-sans text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all duration-150 disabled:opacity-50"
            style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "#34d399" }}
          >
            {working ? "Saving…" : "Enabled — Disable"}
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={working}
            className="font-sans text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all duration-150 disabled:opacity-50"
            style={{ background: HQ_GOLD.bgTint, border: `1px solid ${HQ_GOLD.border}`, color: HQ_GOLD.bright }}
          >
            {working ? "Saving…" : "Enable Notifications"}
          </button>
        )}
      </div>

      {perm === "denied" && (
        <p className="font-sans text-xs leading-relaxed" style={{ color: HQ_TEXT.helper }}>
          Notifications are blocked in your browser. Open Chrome Settings → Site Settings → Notifications → find this site and allow it.
        </p>
      )}

      {error && (
        <p className="font-sans text-xs" style={{ color: "#f87171" }}>{error}</p>
      )}
    </div>
  );
}
