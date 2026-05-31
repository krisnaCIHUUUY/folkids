"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitQuiz, type QuizAnswers } from "@/lib/actions/quiz-attempts";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuestionType } from "@/lib/validations/quiz";

export type RunnerQuestion = {
  id: number;
  order_number: number;
  question_text: string;
  question_type: QuestionType;
  options: unknown;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizRunner({
  quizId,
  questions,
}: {
  quizId: number;
  questions: RunnerQuestion[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<QuizAnswers>({});

  // Acak posisi opsi "kanan" untuk tiap soal mencocokkan (sekali saja).
  const shuffledRights = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const q of questions) {
      if (q.question_type === "mencocokkan" && Array.isArray(q.options)) {
        const rights = (q.options as { left: string; right: string }[]).map((p) => p.right);
        map[q.id] = shuffle(rights);
      }
    }
    return map;
  }, [questions]);

  function setSingle(qid: number, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function setPair(qid: number, left: string, right: string) {
    setAnswers((prev) => {
      const current = (prev[qid] as Record<string, string> | undefined) ?? {};
      return { ...prev, [qid]: { ...current, [left]: right } };
    });
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitQuiz(quizId, answers);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Jawaban terkirim!");
      router.push(`/kuis/${quizId}/hasil`);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-5">
      {questions.map((q, idx) => (
        <article key={q.id} className="clay bg-white p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="clay-sm grid size-9 shrink-0 place-items-center bg-clay-sun font-mono text-sm font-black text-clay-ink">
              {idx + 1}
            </span>
            <p className="pt-1 font-serif text-lg font-bold text-clay-ink">
              {q.question_text}
            </p>
          </div>

          <div className="mt-4 pl-12">
            {q.question_type === "pilihan_ganda" && Array.isArray(q.options) && (
              <div className="grid gap-2">
                {(q.options as string[]).map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSingle(q.id, opt)}
                      className={`clay-sm px-4 py-3 text-left text-sm font-bold transition ${
                        selected ? "bg-clay-mint text-white" : "bg-white text-clay-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.question_type === "benar_salah" && (
              <div className="flex gap-3">
                {(["benar", "salah"] as const).map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSingle(q.id, opt)}
                      className={`clay-sm flex-1 py-3 text-sm font-black capitalize transition ${
                        selected ? "bg-clay-mint text-white" : "bg-white text-clay-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.question_type === "isian" && (
              <Input
                placeholder="Tulis jawabanmu"
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => setSingle(q.id, e.target.value)}
              />
            )}

            {q.question_type === "mencocokkan" && Array.isArray(q.options) && (
              <div className="space-y-2">
                {(q.options as { left: string; right: string }[]).map((pair) => {
                  const current =
                    (answers[q.id] as Record<string, string> | undefined)?.[pair.left] ?? "";
                  return (
                    <div key={pair.left} className="flex items-center gap-2">
                      <span className="clay-sm flex-1 bg-clay-cream px-3 py-2 text-sm font-bold text-clay-ink">
                        {pair.left}
                      </span>
                      <span className="shrink-0 font-black text-clay-ink/40">↔</span>
                      <div className="flex-1">
                        <Select
                          value={current}
                          onValueChange={(v) => setPair(q.id, pair.left, v ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih pasangan" />
                          </SelectTrigger>
                          <SelectContent>
                            {(shuffledRights[q.id] ?? []).map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>
      ))}

      <button
        type="button"
        disabled={pending}
        onClick={handleSubmit}
        className="clay-sm w-full bg-clay-rose py-3.5 text-base font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Kirim Jawaban"}
      </button>
    </div>
  );
}
