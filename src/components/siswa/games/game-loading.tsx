import { Loader2 } from "lucide-react";

// Placeholder saat komponen game (client-only, ssr:false) dimuat. Game memakai
// kata acak sehingga tidak boleh dirender di server (mencegah hydration mismatch).
export function GameLoading() {
  return (
    <div className="clay mx-auto mt-6 grid max-w-md place-items-center gap-3 bg-white p-12 text-clay-ink/60">
      <Loader2 className="size-8 animate-spin text-clay-rose" />
      <p className="font-semibold">Memuat permainan…</p>
    </div>
  );
}
