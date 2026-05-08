import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for SSR auth
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // ── Helper: fetch role + status ──────────────────────────────────────────
  async function getProfile() {
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();
    return data;
  }

  // ── /hq/dashboard/* — admin/team only ───────────────────────────────────
  if (pathname.startsWith("/hq/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/hq", request.url));
    }
    const profile = await getProfile();
    if (
      !profile ||
      profile.status !== "active" ||
      !["admin", "team"].includes(profile.role)
    ) {
      return NextResponse.redirect(new URL("/hq", request.url));
    }
  }

  // ── /partner/dashboard/* — partner only ─────────────────────────────────
  if (pathname.startsWith("/partner/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/hq", request.url));
    }
    const profile = await getProfile();
    if (!profile || profile.status !== "active" || profile.role !== "partner") {
      return NextResponse.redirect(new URL("/hq", request.url));
    }
  }

  // ── /hq (login page) — redirect authenticated users to their dashboard ──
  if (pathname === "/hq" && user) {
    const profile = await getProfile();
    if (profile && profile.status === "active") {
      const dest =
        profile.role === "partner" ? "/partner/dashboard" : "/hq/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/hq", "/hq/dashboard/:path*", "/partner/dashboard/:path*"],
};
