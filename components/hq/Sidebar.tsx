"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HQ_TEXT, HQ_GOLD, HQ_NAV } from "@/lib/hq-colors";
import type { Profile } from "@/lib/supabase/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/hq/dashboard", icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { label: "Cadence", href: "/hq/dashboard/cadence", icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  { label: "Leads", href: "/hq/dashboard/leads", icon: <Icon d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /> },
  { label: "Inquiries", href: "/hq/dashboard/partners/inquiries", icon: <Icon d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /> },
  { label: "Analytics", href: "/hq/dashboard/analytics", icon: <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
  { label: "Blog", href: "/hq/dashboard/blogs", icon: <Icon d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
  { label: "Partners", href: "/hq/dashboard/partners", icon: <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
  { label: "Properties", href: "/hq/dashboard/properties", icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { label: "Tasks", href: "/hq/dashboard/tasks", icon: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
  { label: "Documents", href: "/hq/dashboard/documents", icon: <Icon d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /> },
  { label: "Settings", href: "/hq/dashboard/settings", icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/hq";
  }

  function isActive(href: string) {
    if (href === "/hq/dashboard") return pathname === "/hq/dashboard";
    if (href === "/hq/dashboard/partners") return pathname === "/hq/dashboard/partners";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="hidden md:flex md:flex-col w-60 shrink-0 sticky top-0 h-screen border-r overflow-y-auto"
      style={{ background: "#050d19", borderColor: "rgba(255,255,255,0.05)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Link href="/" title="Back to public site">
          <Image src="/logo.png" alt="Island Investors" width={80} height={60} className="h-9 w-auto object-contain" />
        </Link>
        <div>
          <div className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] leading-none" style={{ color: HQ_GOLD.bright }}>HQ</div>
          <div className="font-sans text-[9px] tracking-wide mt-0.5" style={{ color: HQ_TEXT.helper }}>Command Center</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-sans font-medium transition-all duration-150 group"
              style={{
                background: active ? HQ_GOLD.bgTint : "transparent",
                color: active ? HQ_NAV.activeText : HQ_NAV.inactiveText,
                borderLeft: active ? `2px solid ${HQ_GOLD.border}` : "2px solid transparent",
              }}
            >
              <span style={{ color: active ? HQ_NAV.activeIcon : HQ_NAV.inactiveIcon }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {profile && (
          <div className="px-3 py-2.5 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="font-sans text-[11px] font-semibold truncate" style={{ color: HQ_TEXT.secondary }}>{profile.name ?? profile.email}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="font-sans text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
                style={{ background: HQ_GOLD.bgTint, color: HQ_GOLD.text }}
              >
                {profile.role}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm font-sans text-xs font-medium transition-all duration-150"
          style={{ color: HQ_TEXT.muted }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
