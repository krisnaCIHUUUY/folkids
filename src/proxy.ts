import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match semua path KECUALI:
     * - _next/static & _next/image (aset internal Next)
     * - path apa pun yang berakhiran ekstensi file (favicon.ico, sitemap.xml,
     *   gambar, font, video, dst) — aset statis tidak butuh refresh session,
     *   dan daftar ekstensi manual terbukti rawan terlewat (bug redirect
     *   /video/*.mp4 ke /login). Semua route halaman/API tidak bertitik,
     *   dan gerbang auth sebenarnya tetap di layout (requireRole) + RLS.
     */
    "/((?!_next/static|_next/image|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
