import Link from "next/link";
import { Gamepad2, ArrowRight } from "lucide-react";
import { GAMES, type GameKey } from "@/lib/games/config";
import { GameCard } from "@/components/siswa/game-card";

export function GameCardRow({ played }: { played?: GameKey[] }) {
  const playedSet = new Set(played ?? []);
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="clay-sm grid size-10 place-items-center bg-clay-grape text-white">
            <Gamepad2 className="size-5" />
          </span>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
            Game Seru
          </h2>
        </div>
        <Link
          href="/game"
          className="inline-flex items-center gap-1 text-sm font-bold text-clay-rose hover:underline"
        >
          Lihat semua <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GAMES.map((game) => (
          <GameCard key={game.key} game={game} played={playedSet.has(game.key)} />
        ))}
      </div>
    </section>
  );
}
