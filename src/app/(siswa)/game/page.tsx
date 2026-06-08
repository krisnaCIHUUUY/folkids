import Link from "next/link";
import { Star, Coins, Gamepad2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { GAMES } from "@/lib/games/config";

export default async function GameHubPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Tandai game yang sudah pernah dimainkan siswa.
  const { data: plays } = await supabase
    .from("game_plays")
    .select("game")
    .eq("student_id", user!.id);
  const played = new Set((plays ?? []).map((p) => p.game));

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-11 place-items-center bg-clay-grape text-white">
          <Gamepad2 className="size-5" />
        </span>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
            Game Literasi
          </h1>
          <p className="text-sm font-semibold text-clay-ink/60">
            Main sambil belajar mengenal kata!
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => (
          <Link
            key={game.key}
            href={`/game/${game.slug}`}
            className="clay group relative flex flex-col items-center gap-3 bg-white p-6 text-center transition hover:[transform:translateY(-4px)]"
          >
            {played.has(game.key) && (
              <span className="clay-sm absolute right-3 top-3 grid size-8 place-items-center bg-clay-mint text-clay-ink">
                <Check className="size-4" strokeWidth={3} />
              </span>
            )}
            <span className="clay-sm grid size-16 place-items-center bg-clay-lavender text-3xl">
              {game.emoji}
            </span>
            <h2 className="font-serif text-lg font-bold leading-snug text-clay-ink">
              {game.title}
            </h2>
            <p className="text-sm font-semibold text-clay-ink/60">{game.description}</p>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={
                    n <= game.difficulty
                      ? "size-4 fill-clay-sun text-clay-sun"
                      : "size-4 fill-clay-ink/10 text-clay-ink/10"
                  }
                />
              ))}
            </div>
            <span className="clay-sm inline-flex items-center gap-1.5 bg-clay-sun px-3 py-1 font-mono text-xs font-black text-clay-ink">
              <Coins className="size-3.5" /> hingga {game.maxPoints} poin
            </span>
            <span className="clay-sm mt-1 w-full bg-clay-rose py-2.5 text-sm font-black text-white">
              {played.has(game.key) ? "Main Lagi" : "Main"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
