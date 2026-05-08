"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/hq";
  }

  return (
    <button
      onClick={handleLogout}
      className="font-sans text-xs text-silver-600 hover:text-silver-300 transition-colors px-3 py-2 border border-white/5 hover:border-white/10"
    >
      Sign Out
    </button>
  );
}
