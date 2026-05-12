"use client";

import { useState, useEffect } from "react";
import { HQ_TEXT, HQ_GOLD } from "@/lib/hq-colors";

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

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
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
