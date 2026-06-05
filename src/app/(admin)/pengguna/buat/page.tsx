import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserCreateForm } from "@/components/admin/user-create-form";

export default function BuatPenggunaPage() {
  return (
    <div className="pt-2">
      <Link
        href="/pengguna"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 transition hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Tambah Pengguna
      </h1>
      <p className="font-semibold text-clay-ink/60">
        Buat akun guru atau siswa baru.
      </p>
      <UserCreateForm />
    </div>
  );
}
