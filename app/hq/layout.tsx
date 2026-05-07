import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HQ — Island Investors",
  robots: { index: false, follow: false },
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto" style={{ background: "#060E1A" }}>
      {children}
    </div>
  );
}
