import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClassForm } from "@/components/guru/class-form";

export default function BuatKelasPage() {
  return (
    <div className="pt-6">
      <Link
        href="/kelas"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Buat Kelas Baru
      </h1>
      <ClassForm />
    </div>
  );
}
