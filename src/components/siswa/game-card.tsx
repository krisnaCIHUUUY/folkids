import { Star, Coins, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardGame } from "@/lib/mock/siswa-dashboard";

export function GameCard({ game }: { game: DashboardGame }) {
  const locked = game.status === "locked";
  const completed = game.status === "completed";

  return (
    <article
      className={cn(
        "clay-sm relative flex w-56 shrink-0 snap-start flex-col items-center gap-3 bg-white p-5 text-center transition",
        locked ? "opacity-60" : "hover:[transform:translateY(-4px)]",
      )}
    >
      {locked && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.25rem] bg-clay-ink/10 backdrop-blur-[1px]">
          <span className="clay-sm grid size-12 place-items-center bg-white text-clay-ink">
            <Lock className="size-6" />
          </span>
        </div>
      )}

      {completed && (
        <span className="clay-sm absolute right-3 top-3 grid size-8 place-items-center bg-clay-mint text-clay-ink">
          <Check className="size-4" strokeWidth={3} />
        </span>
      )}

      <span className="clay-sm grid size-16 place-items-center bg-clay-lavender text-3xl">
        {game.emoji}
      </span>

      <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
        {game.title}
      </h3>

      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            className={cn(
              "size-4",
              n <= game.difficulty
                ? "fill-clay-sun text-clay-sun"
                : "fill-clay-ink/10 text-clay-ink/10",
            )}
          />
        ))}
      </div>

      <span className="clay-sm inline-flex items-center gap-1.5 bg-clay-sun px-3 py-1 font-mono text-xs font-black text-clay-ink">
        <Coins className="size-3.5" />
        +{game.poinReward} poin
      </span>

      <button
        type="button"
        disabled={locked}
        className="clay-sm mt-1 w-full bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-50"
      >
        {completed ? "Main Lagi" : locked ? "Terkunci" : "Main"}
      </button>
    </article>
  );
}
