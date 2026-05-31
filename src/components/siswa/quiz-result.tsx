import { Check, X, Trophy } from "lucide-react";
import { QUESTION_TYPE_LABEL, type QuestionType } from "@/lib/validations/quiz";

export type ResultItem = {
  id: number;
  order_number: number;
  question_text: string;
  question_type: QuestionType;
  options: unknown;
  correct_answer: string;
  studentAnswer: unknown;
};

function isCorrect(item: ResultItem): boolean {
  const ans = item.studentAnswer;
  switch (item.question_type) {
    case "pilihan_ganda":
    case "benar_salah":
      return typeof ans === "string" && ans === item.correct_answer;
    case "isian":
      return (
        typeof ans === "string" &&
        ans.trim().toLowerCase() === item.correct_answer.trim().toLowerCase()
      );
    case "mencocokkan": {
      if (typeof ans !== "object" || ans === null) return false;
      let pairs: { left: string; right: string }[] = [];
      try {
        pairs = JSON.parse(item.correct_answer);
      } catch {
        return false;
      }
      const obj = ans as Record<string, string>;
      return pairs.every((p) => obj[p.left] === p.right);
    }
  }
}

function answerText(item: ResultItem): string {
  const ans = item.studentAnswer;
  if (ans == null) return "Tidak dijawab";
  if (typeof ans === "string") return ans === "" ? "Tidak dijawab" : ans;
  if (typeof ans === "object") {
    const obj = ans as Record<string, string>;
    const parts = Object.entries(obj).map(([l, r]) => `${l} → ${r}`);
    return parts.length ? parts.join(", ") : "Tidak dijawab";
  }
  return String(ans);
}

function correctText(item: ResultItem): string {
  if (item.question_type === "mencocokkan") {
    try {
      const pairs = JSON.parse(item.correct_answer) as { left: string; right: string }[];
      return pairs.map((p) => `${p.left} → ${p.right}`).join(", ");
    } catch {
      return item.correct_answer;
    }
  }
  return item.correct_answer;
}

export function QuizResult({
  totalScore,
  maxScore,
  items,
}: {
  totalScore: number;
  maxScore: number;
  items: ResultItem[];
}) {
  const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const correctCount = items.filter(isCorrect).length;

  return (
    <div className="mt-6 space-y-5">
      {/* Kartu skor */}
      <div className="clay flex flex-col items-center gap-2 bg-white p-8 text-center">
        <span className="clay-sm grid size-16 place-items-center bg-clay-sun text-clay-ink">
          <Trophy className="size-8" />
        </span>
        <p className="font-mono text-xs font-black uppercase tracking-wider text-clay-ink/55">
          Skormu
        </p>
        <p className="font-serif text-5xl font-black text-clay-ink">{percent}%</p>
        <p className="font-semibold text-clay-ink/70">
          {totalScore} dari {maxScore} poin · {correctCount}/{items.length} soal benar
        </p>
      </div>

      {/* Rincian per soal */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const correct = isCorrect(item);
          return (
            <article key={item.id} className="clay-sm bg-white p-5">
              <div className="flex items-start gap-3">
                <span
                  className={`clay-sm grid size-9 shrink-0 place-items-center text-white ${
                    correct ? "bg-clay-mint" : "bg-clay-coral"
                  }`}
                >
                  {correct ? <Check className="size-5" /> : <X className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-black uppercase tracking-wider text-clay-ink/45">
                    Soal {idx + 1} · {QUESTION_TYPE_LABEL[item.question_type]}
                  </p>
                  <p className="mt-0.5 font-serif text-base font-bold text-clay-ink">
                    {item.question_text}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-clay-ink/70">
                    Jawabanmu:{" "}
                    <span className={correct ? "text-clay-ink" : "text-clay-coral"}>
                      {answerText(item)}
                    </span>
                  </p>
                  {!correct && (
                    <p className="mt-1 text-sm font-semibold text-clay-ink/70">
                      Jawaban benar:{" "}
                      <span className="text-clay-mint">{correctText(item)}</span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
