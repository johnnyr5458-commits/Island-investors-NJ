import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./LogoutButton";

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, company, buying_areas, status")
    .eq("id", user!.id)
    .single() as {
      data: { name: string | null; email: string | null; company: string | null; buying_areas: string | null; status: string } | null;
      error: unknown;
    };

  const firstName = profile?.name?.split(" ")[0] ?? "Partner";

  return (
    <div className="min-h-full px-5 py-10 max-w-4xl mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-12">
        <Link href="/" title="Back to public site">
          <Image src="/logo.png" alt="Island Investors" width={120} height={90} className="h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs text-silver-600 hidden sm:block">{profile?.email}</span>
          <LogoutButton />
        </div>
      </div>

      {/* Welcome hero */}
      <div
        className="relative overflow-hidden p-8 mb-8"
        style={{
          background: "rgba(8,22,40,0.65)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.30)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.55) 40%, rgba(200,150,42,0.55) 60%, transparent)" }} />

        <div className="flex items-start justify-between gap-6">
          <div>
            <span
              className="font-sans text-[9px] font-bold uppercase tracking-[0.22em] px-2.5 py-1 mb-4 inline-block"
              style={{ background: "rgba(200,150,42,0.08)", border: "1px solid rgba(200,150,42,0.20)", color: "rgba(200,150,42,0.80)" }}
            >
              Investor Portal
            </span>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              Welcome back, {firstName}.
            </h1>
            <p className="font-sans text-sm text-silver-500 leading-relaxed max-w-md">
              This is your private Island Investors partner workspace. Exclusive deal flow, early access opportunities, and direct communication — all in one place.
            </p>
          </div>
          {profile?.company && (
            <div className="hidden sm:block text-right shrink-0">
              <div className="font-sans text-[10px] text-silver-700 uppercase tracking-wider mb-1">Company</div>
              <div className="font-sans text-sm text-silver-300">{profile.company}</div>
            </div>
          )}
        </div>
      </div>

      {/* Deals coming soon card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          className="p-6 relative overflow-hidden"
          style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.25) 50%, transparent)" }} />
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(200,150,42,0.70)" }}>
              Exclusive Deal Flow
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Available Deals</h2>
          <p className="font-sans text-sm text-silver-600 leading-relaxed mb-4">
            Off-market properties and acquisition opportunities will appear here when available.
          </p>
          <div
            className="inline-flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1.5"
            style={{ background: "rgba(200,150,42,0.06)", border: "1px solid rgba(200,150,42,0.15)", color: "rgba(200,150,42,0.55)" }}
          >
            <span className="w-1 h-1 rounded-full bg-gold-500 animate-pulse" />
            Launching Soon
          </div>
        </div>

        <div
          className="p-6 relative overflow-hidden"
          style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.25) 50%, transparent)" }} />
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-silver-600" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-silver-600">
              Your Markets
            </span>
          </div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Coverage Areas</h2>
          <p className="font-sans text-sm text-silver-500">
            {profile?.buying_areas ?? "Your investment areas have not been configured yet. Contact the Island Investors team to update your profile."}
          </p>
        </div>
      </div>

      {/* Status + contact */}
      <div
        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: "rgba(5,13,25,0.60)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-sans text-xs text-silver-500">
            Your account is <strong className="text-emerald-400">active</strong> — you have full partner access.
          </span>
        </div>
        <a
          href="mailto:team@islandinvestorsnj.com"
          className="font-sans text-xs font-bold uppercase tracking-wider transition-all px-4 py-2.5 shrink-0"
          style={{ background: "rgba(200,150,42,0.10)", border: "1px solid rgba(200,150,42,0.25)", color: "rgba(200,150,42,0.80)" }}
        >
          Contact Team →
        </a>
      </div>

      <p className="font-sans text-[10px] text-silver-800 text-center mt-6">
        Island Investors LLC · Private Partner Portal · Not publicly accessible
      </p>
    </div>
  );
}
