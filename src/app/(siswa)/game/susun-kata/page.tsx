"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { GameLoading } from "@/components/siswa/games/game-loading";

// Client-only (ssr:false): game memakai kata acak → tak boleh dirender di server.
const SusunKataGame = dynamic(
  () =>
    import("@/components/siswa/games/susun-kata-game").then(
      (m) => m.SusunKataGame,
    ),
  { ssr: false, loading: () => <GameLoading /> },
);

export default function SusunKataPage() {
  return (
    <div className="pt-6">
      <Link
        href="/game"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar game
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        🔤 Susun Kata Acak
      </h1>
      <SusunKataGame />
    </div>
  );
}
