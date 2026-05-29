import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccess, isPublicPath, roleHome } from "@/lib/roles";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session token. JANGAN tambah logic apa pun di antara
  // createServerClient dan getUser() — bisa menyebabkan session hilang.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Bangun redirect sambil mempertahankan cookie session yang sudah di-refresh.
  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  };

  // Belum login: hanya boleh akses halaman publik.
  if (!user) {
    if (!isPublicPath(pathname)) {
      return redirectTo("/login");
    }
    return supabaseResponse;
  }

  // Sudah login: ambil role + status aktif dari profil.
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  // Profil tidak ada / nonaktif → paksa kembali ke login.
  if (!profile || !profile.is_active) {
    return pathname === "/login" ? supabaseResponse : redirectTo("/login");
  }

  const role = profile.role;

  // Sudah login tapi membuka halaman auth → arahkan ke portal sesuai role.
  if (pathname === "/login" || pathname === "/register") {
    return redirectTo(roleHome(role));
  }

  // Gating per role untuk area terproteksi.
  if (!canAccess(pathname, role)) {
    return redirectTo(roleHome(role));
  }

  return supabaseResponse;
}
