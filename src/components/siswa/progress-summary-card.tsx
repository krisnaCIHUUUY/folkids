import { BookOpen, Gamepad2, Coins } from "lucide-react";
import type { DashboardMetrics } from "@/lib/mock/siswa-dashboard";
import { WayangAccent } from "@/components/wayang-accent";

const TILES = [
  {
    key: "ceritaDibaca" as const,
    label: "Cerita Dibaca",
    icon: BookOpen,
    bg: "bg-clay-coral",
  },
  {
    key: "gameDimainkan" as const,
    label: "Game Dimainkan",
    icon: Gamepad2,
    bg: "bg-clay-mint",
  },
  {
    key: "totalPoin" as const,
    label: "Total Poin",
    icon: Coins,
    bg: "bg-clay-sun",
  },
];

export function ProgressSummaryCard({
  name,
  metrics,
}: {
  name: string;
  metrics: DashboardMetrics;
}) {
  return (
    <section className="clay relative mt-6 overflow-hidden bg-white p-6 md:p-8">
      <WayangAccent className="absolute -right-6 -top-8 h-40 text-clay-rose/10" />
      <div className="relative">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          Selamat datang kembali
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-clay-ink md:text-4xl">
          Halo, {name}! 👋
        </h1>
        <p className="mt-2 max-w-lg font-semibold text-clay-ink/70">
          Ayo lanjutkan petualangan literasimu hari ini. Baca cerita seru dan
          kumpulkan poin sebanyak-banyaknya!
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {TILES.map(({ key, label, icon: Icon, bg }) => (
            <div
              key={key}
              className="clay-sm flex items-center gap-4 bg-white p-4"
            >
              <span
                className={`clay-sm grid size-12 shrink-0 place-items-center text-white ${bg}`}
              >
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
      </div>
    </section>
  );
}
