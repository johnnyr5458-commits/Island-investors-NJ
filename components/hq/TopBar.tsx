"use client";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b shrink-0"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(5,13,25,0.60)", backdropFilter: "blur(8px)" }}
    >
      <div>
        <h1 className="font-display text-base md:text-xl font-semibold text-white leading-tight">{title}</h1>
        {subtitle && <p className="font-sans text-xs text-silver-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div
          className="hidden lg:flex items-center gap-1.5 font-sans text-[10px] text-silver-700 px-3 py-1.5 rounded-sm"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-silver-500">Live</span>
          <span className="mx-1 text-silver-800">·</span>
          <span>{now}</span>
        </div>
      </div>
    </header>
  );
}
