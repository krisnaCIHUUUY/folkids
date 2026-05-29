import { Eye, Download } from "lucide-react";
import type { QuizResult } from "@/lib/mock/guru-dashboard";

const DISTRIBUTION = [
  { key: "avg" as const, label: "Rata-rata", color: "text-clay-blue" },
  { key: "highest" as const, label: "Tertinggi", color: "text-clay-mint" },
  { key: "lowest" as const, label: "Terendah", color: "text-clay-coral" },
];

export function QuizResultCard({ data }: { data: QuizResult }) {
  const inProgress = data.status === "in-progress";
  const submitPct = data.total ? Math.round((data.submitted / data.total) * 100) : 0;

  return (
    <article className="clay-sm flex flex-col gap-4 bg-white p-5 transition hover:[transform:translateY(-4px)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
            {data.title}
          </h3>
          <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
            {data.className}
          </p>
        </div>
        <span
          className={`clay-sm shrink-0 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider ${
            inProgress ? "bg-clay-mint/30 text-clay-ink" : "bg-clay-ink/10 text-clay-ink/60"
          }`}
        >
          {inProgress ? "Berlangsung" : "Selesai"}
        </span>
      </div>

      {inProgress ? (
        <div>
          <div className="flex items-center justify-between font-mono text-xs font-bold text-clay-ink/65">
            <span>Pengumpulan</span>
            <span>
              {data.submitted}/{data.total}
            </span>
          </div>
          <div className="clay-inset mt-1.5 h-3 overflow-hidden bg-clay-cream">
            <div
              className="h-full rounded-full bg-clay-mint transition-all"
              style={{ width: `${submitPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {DISTRIBUTION.map(({ key, label, color }) => (
            <div key={key} className="clay-inset bg-clay-cream p-3 text-center">
              <p className={`text-2xl font-black leading-none ${color}`}>
                {data[key]}
              </p>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink/55">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-1">
        <button
          type="button"
          className="clay-sm inline-flex flex-1 items-center justify-center gap-1.5 bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Eye className="size-4" />
          Lihat Detail
        </button>
        <button
          type="button"
          className="clay-sm inline-flex flex-1 items-center justify-center gap-1.5 bg-white py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Download className="size-4" />
          Unduh Rekap
        </button>
      </div>
    </article>
  );
}
