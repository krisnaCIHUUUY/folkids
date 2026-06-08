"use client";

import Link from "next/link";
import { Coins, RotateCcw, Home, Trophy } from "lucide-react";

// Layar "Selesai" bersama untuk ketiga game: menampilkan skor + poin yang
// tersimpan, tombol main lagi & kembali ke beranda.
export function GameResult({
  score,
  points,
  saving,
  onReplay,
  caption,
}: {
  score: number;
  points: number;
  saving: boolean;
  onReplay: () => void;
  caption?: string;
}) {
  return (
    <div className="clay mx-auto mt-6 max-w-md bg-white p-8 text-center">
      <span className="clay-sm mx-auto grid size-20 place-items-center bg-clay-sun text-4xl">
        <Trophy className="size-9 text-clay-ink" />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-black text-clay-ink">Hebat! 🎉</h2>
      {caption && (
        <p className="mt-1 font-semibold text-clay-ink/70">{caption}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="clay-inset bg-clay-cream p-4">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-clay-ink/55">
            Skor
          </p>
          <p className="mt-1 font-serif text-3xl font-black text-clay-ink">{score}</p>
        </div>
        <div className="clay-inset bg-clay-cream p-4">
          <p className="font-mono text-xs font-black uppercase tracking-wider text-clay-ink/55">
            Poin
          </p>
          <p className="mt-1 inline-flex items-center gap-1 font-serif text-3xl font-black text-clay-ink">
            <Coins className="size-6 text-clay-sun" />
            {saving ? "…" : `+${points}`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          className="clay-sm inline-flex flex-1 items-center justify-center gap-1.5 bg-clay-rose py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <RotateCcw className="size-4" /> Main Lagi
        </button>
        <Link
          href="/game"
          className="clay-sm inline-flex flex-1 items-center justify-center gap-1.5 bg-white py-3 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Home className="size-4" /> Game Lain
        </Link>
      </div>
    </div>
  );
}
