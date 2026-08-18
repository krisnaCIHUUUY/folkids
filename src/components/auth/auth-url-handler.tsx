"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { roleHome, type UserRole } from "@/lib/roles";

// Supabase mengirim hasil auth ke aplikasi lewat dua format tergantung
// Flow Type di dashboard URL Configuration:
//  - PKCE  (default baru): `?code=...&next=...` di query string
//  - Implicit: `#access_token=...&type=recovery` di URL fragment
// Handler ini memproses keduanya di klien agar cookie session terisi,
// lalu mengarahkan ke halaman tujuan (`next` / role home / /reset-password).
export function AuthUrlHandler() {
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const searchNext = searchParams.get("next");

    // PKCE flow: tukar `code` menjadi session.
    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        window.history.replaceState(null, "", window.location.pathname);
        if (error) {
          router.replace("/login?error=auth_callback");
          return;
        }
        router.replace(searchNext && searchNext.startsWith("/") ? searchNext : "/");
      });
      return;
    }

    // Implicit flow: token ada di URL fragment (`#access_token=...`).
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    const next = params.get("next") ?? searchNext;

    // Bersihkan hash sebelum memproses agar token tidak tersimpan di riwayat.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    const errorCode = params.get("error_code");
    if (errorCode) {
      router.replace(`/login?error=auth_${errorCode}`);
      return;
    }

    if (!accessToken) return;

    const supabase = createClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken ?? "" })
      .then(({ error }) => {
        if (error) {
          router.replace("/login?error=session");
          return;
        }

        const destination =
          next && next.startsWith("/")
            ? next
            : type === "recovery"
              ? "/reset-password"
              : type === "email"
                ? roleFromToken(accessToken) ?? "/"
                : "/";

        router.replace(destination);
      });
  }, [router]);

  return null;
}

function roleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload?.user_metadata?.role as UserRole | undefined;
    if (!role) return null;
    return roleHome(role);
  } catch {
    return null;
  }
}
