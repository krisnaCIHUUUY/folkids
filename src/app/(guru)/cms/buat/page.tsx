import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StoryForm } from "@/components/guru/story-form";

export default function BuatCeritaPage() {
  return (
    <div className="pt-6">
      <Link
        href="/cms"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Buat Cerita Baru
      </h1>
      <StoryForm />
    </div>
  );
}
