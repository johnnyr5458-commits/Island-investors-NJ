import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HQ — Island Investors",
  robots: { index: false, follow: false },
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden" style={{ background: "#060E1A" }}>
      {/* Dashboard pages use flex-1 + overflow-y-auto internally; login page adds its own scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}
