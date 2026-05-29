import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardBadge } from "@/lib/mock/siswa-dashboard";

function BadgeItem({ badge }: { badge: DashboardBadge }) {
  const { unlocked } = badge;

  return (
    <article
      className={cn(
        "clay-sm relative flex flex-col items-center gap-2 bg-white p-5 text-center transition",
        unlocked
          ? "hover:[transform:translateY(-4px)]"
          : "opacity-70 grayscale",
      )}
    >
      {!unlocked && (
        <span className="clay-sm absolute right-3 top-3 grid size-7 place-items-center bg-clay-cream text-clay-ink/60">
          <Lock className="size-3.5" />
        </span>
      )}
      <span
        className={cn(
          "clay-sm grid size-16 place-items-center text-3xl",
          unlocked ? "bg-clay-sun" : "bg-clay-cream",
        )}
      >
        {badge.emoji}
      </span>
      <h3 className="font-serif text-base font-bold leading-snug text-clay-ink">
        {badge.name}
      </h3>
      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
        {badge.description}
      </p>
    </article>
  );
}

export function BadgeCollection({ badges }: { badges: DashboardBadge[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-clay-ink">
          <Trophy className="size-5" />
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Koleksi Lencana
        </h2>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}
      </div>
    </section>
  );
}
