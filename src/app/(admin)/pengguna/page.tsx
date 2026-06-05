import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { UsersTable, type AdminUser } from "@/components/admin/users-table";

export default async function PenggunaPage() {
  const me = await getCurrentUser();
  const supabase = await createClient();

  // Hanya kelola pengguna siswa & guru. Akun admin diatur di halaman "Akun Saya".
  const { data } = await supabase
    .from("users")
    .select("id, name, email, role, is_active, created_at")
    .in("role", ["siswa", "guru"])
    .order("created_at", { ascending: false });

  const users: AdminUser[] = (data ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    // Siswa: username = bagian lokal email sintetis (username@siswa.folkids.local).
    username: u.role === "siswa" ? u.email.split("@")[0] : null,
    role: u.role,
    isActive: u.is_active,
  }));

  return (
    <div className="pt-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="clay-sm grid size-11 place-items-center bg-clay-lavender text-clay-ink">
            <Users className="size-5" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
              Manajemen Pengguna
            </h1>
            <p className="font-semibold text-clay-ink/60">
              Kelola akun guru & siswa.
            </p>
          </div>
        </div>
        <Link
          href="/pengguna/buat"
          className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <UserPlus className="size-4" /> Tambah Pengguna
        </Link>
      </div>

      <UsersTable users={users} currentUserId={me!.id} />
    </div>
  );
}
