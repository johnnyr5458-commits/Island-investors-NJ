"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HQ_GOLD, HQ_NAV } from "@/lib/hq-colors";

function DockIcon({ d }: { d: string }) {
  return (
    <svg
      style={{ width: 22, height: 22, flexShrink: 0 }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const DOCK: { label: string; href: string; icon: React.ReactNode; exact?: boolean }[] = [
  {
    label: "Home",
    href: "/hq/dashboard",
    exact: true,
    icon: <DockIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  },
  {
    label: "Leads",
    href: "/hq/dashboard/leads",
    icon: <DockIcon d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />,
  },
  {
    label: "Blog",
    href: "/hq/dashboard/blogs",
    icon: <DockIcon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
  },
  {
    label: "Partners",
    href: "/hq/dashboard/partners",
    icon: <DockIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
  {
    label: "Tasks",
    href: "/hq/dashboard/tasks",
    icon: <DockIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  },
  {
    label: "Settings",
    href: "/hq/dashboard/settings",
    icon: <DockIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
];

export default function BottomDock() {
  const pathname = usePathname();

  // Focus mode: hide dock on editor pages so content has full screen
  const isFocusMode =
    pathname.startsWith("/hq/dashboard/blogs/new") ||
    pathname.startsWith("/hq/dashboard/blogs/edit");

  if (isFocusMode) return null;

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      aria-label="Mobile navigation"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          paddingTop: "8px",
          paddingBottom: "8px",
          borderRadius: "20px",
          background: "rgba(5,13,25,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 -2px 24px rgba(0,0,0,0.30), 0 8px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {DOCK.map(({ label, href, icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                padding: "6px 10px",
                borderRadius: "14px",
                color: active ? HQ_NAV.activeText : HQ_NAV.inactiveText,
                background: active ? HQ_GOLD.bgTint : "transparent",
                textDecoration: "none",
                transition: "color 150ms, background 150ms",
                minWidth: 0,
              }}
            >
              {icon}
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
