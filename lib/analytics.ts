// Central analytics hub.
// All tracking calls go through here — add new providers (Meta Pixel,
// Google Ads, heatmaps) alongside the gtag calls below without touching
// any component that already calls these helpers.

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    // fbq: (...args: unknown[]) => void;       // Meta Pixel — uncomment when ready
    // _hsq: unknown[][];                        // HubSpot — uncomment when ready
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

// ─── Core ─────────────────────────────────────────────────────────────────────

export function trackPageView(url: string) {
  if (!GA_ID) return;
  gtag("config", GA_ID, { page_path: url });
}

export function trackEvent({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) {
  if (!GA_ID) return;
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });

  // ── Meta Pixel (uncomment after adding fbq script) ───────────────────────
  // if (typeof window.fbq === "function") {
  //   window.fbq("trackCustom", action, { category, label });
  // }
}

// ─── Typed event helpers ───────────────────────────────────────────────────────

export type FormName = "seller_contact" | "partner_inquiry";

export function trackFormSubmit(formName: FormName) {
  trackEvent({ action: "form_submit", category: "lead", label: formName });

  // ── Google Ads conversion (uncomment and fill in your conversion tag) ─────
  // gtag("event", "conversion", {
  //   send_to: "AW-XXXXXXXXX/YYYYYYYYYYY",
  //   value: 1.0,
  //   currency: "USD",
  // });

  // ── Meta Pixel lead event ─────────────────────────────────────────────────
  // if (typeof window.fbq === "function") window.fbq("track", "Lead");
}

export function trackCTAClick(label: string) {
  trackEvent({ action: "cta_click", category: "engagement", label });
}

export function trackPhoneCall(source: "sticky_bar" | "header" | "footer" | "inline") {
  trackEvent({ action: "phone_call", category: "engagement", label: source });

  // ── Google Ads call conversion ─────────────────────────────────────────
  // gtag("event", "conversion", { send_to: "AW-XXXXXXXXX/YYYYYYYYYYY" });
}
