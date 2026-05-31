"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteQuestion, moveQuestion } from "@/lib/actions/quizzes";
import {
  QuestionForm,
  EMPTY_QUESTION,
} from "@/components/guru/question-form";
import {
  QUESTION_TYPE_LABEL,
  type QuestionFormValues,
  type QuestionType,
  type MatchPair,
} from "@/lib/validations/quiz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type QuestionData = {
  id: number;
  order_number: number;
  question_text: string;
  question_type: QuestionType;
  options: unknown;
  correct_answer: string;
  score_weight: number;
};

// Ubah baris DB → bentuk form (rich) untuk diedit.
function toFormValues(q: QuestionData): QuestionFormValues {
  const base: QuestionFormValues = {
    ...EMPTY_QUESTION,
    question_text: q.question_text,
    question_type: q.question_type,
    score_weight: q.score_weight,
    choices: [{ value: "" }, { value: "" }],
    correctIndex: null,
    boolAnswer: null,
    isianAnswer: "",
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
  };

  switch (q.question_type) {
    case "pilihan_ganda": {
      const opts = Array.isArray(q.options) ? (q.options as string[]) : [];
      return {
        ...base,
        choices: opts.length ? opts.map((v) => ({ value: String(v) })) : base.choices,
        correctIndex: opts.indexOf(q.correct_answer) >= 0 ? opts.indexOf(q.correct_answer) : null,
      };
    }
    case "benar_salah":
      return {
        ...base,
        boolAnswer: q.correct_answer === "benar" || q.correct_answer === "salah" ? q.correct_answer : null,
      };
    case "isian":
      return { ...base, isianAnswer: q.correct_answer };
    case "mencocokkan": {
      let parsed: MatchPair[] = [];
      try {
        const fromAnswer = JSON.parse(q.correct_answer);
        if (Array.isArray(fromAnswer)) parsed = fromAnswer as MatchPair[];
      } catch {
        if (Array.isArray(q.options)) parsed = q.options as MatchPair[];
      }
      return { ...base, pairs: parsed.length ? parsed : base.pairs };
    }
  }
}

function answerPreview(q: QuestionData): string {
  switch (q.question_type) {
    case "mencocokkan":
      return "Lihat pasangan saat edit";
    case "pilihan_ganda":
    case "benar_salah":
    case "isian":
      return `Jawaban: ${q.correct_answer}`;
  }
}

export function QuizQuestionsManager({
  storyId,
  quizId,
  questions,
}: {
  storyId: number;
  quizId: number;
  questions: QuestionData[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionData | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(q: QuestionData) {
    setEditing(q);
    setDialogOpen(true);
  }

  function handleMove(id: number, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveQuestion(id, quizId, storyId, direction);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteQuestion(id, quizId, storyId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Soal dihapus");
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={openAdd}
        className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Plus className="size-4" /> Tambah Soal
      </button>

      {questions.length === 0 ? (
        <div className="clay-inset mt-5 bg-clay-cream p-8 text-center">
          <p className="font-semibold text-clay-ink/60">
            Belum ada soal. Tambahkan soal pertama untuk kuis ini.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {questions.map((q, idx) => (
            <article key={q.id} className="clay-sm flex items-start gap-4 bg-white p-4">
              <span className="clay-sm grid size-10 shrink-0 place-items-center bg-clay-sun font-mono text-base font-black text-clay-ink">
                {q.order_number}
              </span>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-clay-ink/80">
                  {q.question_text}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs font-bold text-clay-ink/55">
                  <span className="clay-sm bg-clay-lavender px-2 py-0.5 text-clay-ink">
                    {QUESTION_TYPE_LABEL[q.question_type]}
                  </span>
                  <span>{answerPreview(q)}</span>
                  <span>Bobot {q.score_weight}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Naikkan urutan"
                  disabled={pending || idx === 0}
                  onClick={() => handleMove(q.id, "up")}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Turunkan urutan"
                  disabled={pending || idx === questions.length - 1}
                  onClick={() => handleMove(q.id, "down")}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Edit soal"
                  onClick={() => openEdit(q)}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)]"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Hapus soal"
                  disabled={pending}
                  onClick={() => handleDelete(q.id)}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)] disabled:opacity-60"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Soal" : "Tambah Soal"}</DialogTitle>
          </DialogHeader>
          <QuestionForm
            key={editing?.id ?? "new"}
            storyId={storyId}
            quizId={quizId}
            questionId={editing?.id}
            defaultValues={editing ? toFormValues(editing) : undefined}
            onDone={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
