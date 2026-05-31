"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type ActionError = { error: string };
export type SubmitResult = ActionError | { ok: true; totalScore: number; maxScore: number };

// Jawaban: { [questionId]: string | { [left]: right } }
export type QuizAnswers = Record<string, unknown>;

export async function submitQuiz(
  quizId: number,
  answers: QuizAnswers,
): Promise<SubmitResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "siswa") return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_quiz_attempt", {
    p_quiz_id: quizId,
    p_answers: answers as never,
  });

  if (error) {
    console.error("[submitQuiz]", error.code, error.message);
    return { error: "Gagal mengirim jawaban. Coba lagi." };
  }

  const result = data as { ok: boolean; error?: string; total_score?: number; max_score?: number };
  if (!result?.ok) {
    return { error: result?.error ?? "Gagal mengirim jawaban." };
  }

  // Segarkan cache rute agar halaman kuis & hasil membaca attempt terbaru.
  revalidatePath(`/kuis/${quizId}`);
  revalidatePath(`/kuis/${quizId}/hasil`);

  return { ok: true, totalScore: result.total_score ?? 0, maxScore: result.max_score ?? 0 };
}
