import Link from "next/link";
import { BookOpen, PencilLine, Users, Plus } from "lucide-react";
import type { GuruMetrics } from "@/lib/mock/guru-dashboard";
import { WayangAccent } from "@/components/wayang-accent";

const TILES = [
  { key: "ceritaDiunggah" as const, label: "Cerita Diunggah", icon: BookOpen, bg: "bg-clay-coral" },
  { key: "kuisDibuat" as const, label: "Kuis Dibuat", icon: PencilLine, bg: "bg-clay-mint" },
  { key: "kelasAktif" as const, label: "Kelas Aktif", icon: Users, bg: "bg-clay-sky" },
];

export function ContentSummaryCard({
  name,
  metrics,
}: {
  name: string;
  metrics: GuruMetrics;
}) {
  return (
    <section className="clay relative mt-6 overflow-hidden bg-white p-6 md:p-8">
      <WayangAccent className="absolute -right-6 -top-8 h-40 text-clay-rose/10" />
      <div className="relative">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          Dasbor Guru
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-clay-ink md:text-4xl">
          Selamat datang, {name}! 👋
        </h1>
        <p className="mt-2 max-w-lg font-semibold text-clay-ink/70">
          Pantau perkembangan literasi siswa dan kelola konten pembelajaranmu
          hari ini.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {TILES.map(({ key, label, icon: Icon, bg }) => (
            <div key={key} className="clay-sm flex items-center gap-4 bg-white p-4">
              <span className={`clay-sm grid size-12 shrink-0 place-items-center text-white ${bg}`}>
                <Icon className="size-6" />
              </span>
              <div>
                <p className="text-2xl font-black leading-none text-clay-ink">
                  {metrics[key].toLocaleString("id-ID")}
                </p>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/cms/buat"
            className="clay-sm inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Plus className="size-4" />
            Unggah Cerita
          </Link>
          <button
            type="button"
            className="clay-sm inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Plus className="size-4" />
            Buat Kuis
          </button>
        </div>
      </div>
    </section>
  );
}
