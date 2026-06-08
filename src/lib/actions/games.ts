"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { GAME_BY_KEY, type GameKey } from "@/lib/games/config";
import type { Json } from "@/types/database";

export type ActionError = { error: string };

export type RecordGamePlayInput = {
  game: GameKey;
  score: number;
  points: number;
  durationSeconds?: number;
  detail?: Json;
};

// Catat satu permainan game literasi. RLS membatasi insert ke siswa untuk
// dirinya sendiri. Poin di-clamp server-side ke [0, maxPoints] per game untuk
// mencegah inflasi dari klien (game arcade real-time tak bisa sepenuhnya
// server-authoritative seperti kuis — clamp ini batas wajar).
export async function recordGamePlay(
  input: RecordGamePlayInput,
): Promise<ActionError | { ok: true; points: number }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "siswa") return { error: "Tidak diizinkan" };

  const config = GAME_BY_KEY[input.game];
  if (!config) return { error: "Game tidak dikenal" };

  const points = Math.max(0, Math.min(config.maxPoints, Math.round(input.points)));
  const score = Math.max(0, Math.round(input.score));
  const duration =
    typeof input.durationSeconds === "number" && Number.isFinite(input.durationSeconds)
      ? Math.max(0, Math.round(input.durationSeconds))
      : null;

  const supabase = await createClient();
  const { error } = await supabase.from("game_plays").insert({
    student_id: user.id,
    game: input.game,
    score,
    points,
    duration_seconds: duration,
    detail: input.detail ?? null,
  });

  if (error) {
    console.error("[recordGamePlay]", error.code, error.message);
    return { error: "Gagal menyimpan hasil permainan." };
  }

  revalidatePath("/beranda");
  return { ok: true, points };
}
