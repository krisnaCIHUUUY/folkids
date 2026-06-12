import type { Database } from "@/types/database";

export type UserRole = Database["public"]["Enums"]["user_role"];

// Halaman tujuan default tiap role setelah login.
export const ROLE_HOME: Record<UserRole, string> = {
  siswa: "/beranda",
  guru: "/dashboard",
  admin: "/admin",
};

export function roleHome(role: UserRole | null | undefined): string {
  return role ? ROLE_HOME[role] : "/login";
}

// Prefix route yang diproteksi per role.
export const SISWA_PREFIXES = ["/beranda", "/perpustakaan", "/cerita", "/kuis", "/game", "/papan-peringkat", "/gabung-kelas", "/lencana"];
export const GURU_ADMIN_PREFIXES = ["/dashboard", "/cms", "/asesmen", "/kelas", "/tugas"];
export const ADMIN_PREFIXES = ["/pengguna", "/admin", "/akun"];

export function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Apakah path bisa diakses tanpa login.
export function isPublicPath(pathname: string): boolean {
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/lupa-password"
  ) {
    return true;
  }
  return pathname.startsWith("/api/auth");
}

// Cek apakah role boleh mengakses path. true bila path bukan area terproteksi.
export function canAccess(pathname: string, role: UserRole): boolean {
  if (matchesPrefix(pathname, ADMIN_PREFIXES)) return role === "admin";
  if (matchesPrefix(pathname, GURU_ADMIN_PREFIXES)) {
    return role === "guru" || role === "admin";
  }
  if (matchesPrefix(pathname, SISWA_PREFIXES)) return role === "siswa";
  return true;
}
