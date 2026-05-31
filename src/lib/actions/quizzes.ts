"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import {
  quizSchema,
  quizQuestionPayloadSchema,
  type QuizFormValues,
  type QuizQuestionPayload,
} from "@/lib/validations/quiz";

export type ActionError = { error: string };

async function requireGuruAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "guru" && user.role !== "admin")) {
    return null;
  }
  return user;
}

// =========================
// Kuis
// =========================
export async function createQuiz(
  storyId: number,
  values: QuizFormValues,
): Promise<ActionError | { id: number }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = quizSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      story_id: storyId,
      title: parsed.data.title,
      time_limit_minutes: parsed.data.time_limit_minutes,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createQuiz]", error?.code, error?.message);
    return { error: "Gagal membuat kuis. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis`);
  revalidatePath("/dashboard");
  return { id: data.id };
}

export async function updateQuiz(
  quizId: number,
  storyId: number,
  values: QuizFormValues,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = quizSchema.safeParse(values);
  if (!parsed.success) return { error: "Input tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quizzes")
    .update({
      title: parsed.data.title,
      time_limit_minutes: parsed.data.time_limit_minutes,
    })
    .eq("id", quizId);

  if (error) {
    console.error("[updateQuiz]", error.code, error.message);
    return { error: "Gagal menyimpan kuis. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis`);
  revalidatePath(`/cms/${storyId}/kuis/${quizId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteQuiz(
  quizId: number,
  storyId: number,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

  if (error) {
    console.error("[deleteQuiz]", error.code, error.message);
    return { error: "Gagal menghapus kuis. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis`);
  revalidatePath("/dashboard");
  return { ok: true };
}

// =========================
// Soal
// =========================
export async function createQuestion(
  quizId: number,
  storyId: number,
  payload: QuizQuestionPayload,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = quizQuestionPayloadSchema.safeParse(payload);
  if (!parsed.success) return { error: "Input soal tidak valid" };

  const supabase = await createClient();

  // order_number berikutnya = max + 1 (default 1 bila belum ada soal).
  const { data: last } = await supabase
    .from("quiz_questions")
    .select("order_number")
    .eq("quiz_id", quizId)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = (last?.order_number ?? 0) + 1;

  const { error } = await supabase.from("quiz_questions").insert({
    quiz_id: quizId,
    question_text: parsed.data.question_text,
    question_type: parsed.data.question_type,
    options: parsed.data.options,
    correct_answer: parsed.data.correct_answer,
    score_weight: parsed.data.score_weight,
    order_number: nextNumber,
  });

  if (error) {
    console.error("[createQuestion]", error.code, error.message);
    return { error: "Gagal menambah soal. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis/${quizId}`);
  revalidatePath(`/cms/${storyId}/kuis`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateQuestion(
  questionId: number,
  quizId: number,
  storyId: number,
  payload: QuizQuestionPayload,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const parsed = quizQuestionPayloadSchema.safeParse(payload);
  if (!parsed.success) return { error: "Input soal tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question_text: parsed.data.question_text,
      question_type: parsed.data.question_type,
      options: parsed.data.options,
      correct_answer: parsed.data.correct_answer,
      score_weight: parsed.data.score_weight,
    })
    .eq("id", questionId);

  if (error) {
    console.error("[updateQuestion]", error.code, error.message);
    return { error: "Gagal menyimpan soal. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis/${quizId}`);
  return { ok: true };
}

export async function deleteQuestion(
  questionId: number,
  quizId: number,
  storyId: number,
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);

  if (error) {
    console.error("[deleteQuestion]", error.code, error.message);
    return { error: "Gagal menghapus soal. Coba lagi." };
  }

  revalidatePath(`/cms/${storyId}/kuis/${quizId}`);
  revalidatePath(`/cms/${storyId}/kuis`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function moveQuestion(
  questionId: number,
  quizId: number,
  storyId: number,
  direction: "up" | "down",
): Promise<ActionError | { ok: true }> {
  const user = await requireGuruAdmin();
  if (!user) return { error: "Tidak diizinkan" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_quiz_question", {
    p_question_id: questionId,
    p_direction: direction,
  });

  if (error) {
    console.error("[moveQuestion]", error.code, error.message);
    return { error: "Gagal mengubah urutan soal." };
  }

  revalidatePath(`/cms/${storyId}/kuis/${quizId}`);
  return { ok: true };
}
