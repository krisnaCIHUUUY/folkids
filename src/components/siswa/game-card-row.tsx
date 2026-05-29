import { Gamepad2 } from "lucide-react";
import type { DashboardGame } from "@/lib/mock/siswa-dashboard";
import { GameCard } from "@/components/siswa/game-card";

export function GameCardRow({ games }: { games: DashboardGame[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-grape text-white">
          <Gamepad2 className="size-5" />
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Game Seru
        </h2>
      </div>

      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
