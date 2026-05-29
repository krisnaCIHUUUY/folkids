import { Clock, PlayCircle, AlertCircle } from "lucide-react";
import type { DashboardTask, TaskStatus } from "@/lib/mock/siswa-dashboard";

const STATUS_CONFIG: Record<
  TaskStatus,
  { border: string; pill: string; label: string; icon: typeof Clock }
> = {
  unstarted: {
    border: "border-l-clay-blue",
    pill: "bg-clay-sky text-clay-ink",
    label: "Belum dimulai",
    icon: Clock,
  },
  "in-progress": {
    border: "border-l-clay-sun",
    pill: "bg-clay-sun text-clay-ink",
    label: "Sedang dikerjakan",
    icon: PlayCircle,
  },
  overdue: {
    border: "border-l-clay-coral",
    pill: "bg-clay-coral text-white",
    label: "Terlambat",
    icon: AlertCircle,
  },
};

export function TaskCard({ task }: { task: DashboardTask }) {
  const cfg = STATUS_CONFIG[task.status];
  const Icon = cfg.icon;

  return (
    <article
      className={`clay-sm flex flex-col gap-3 border-l-8 bg-white p-5 transition hover:[transform:translateY(-4px)] ${cfg.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`clay-sm inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider ${cfg.pill}`}
        >
          <Icon className="size-3.5" />
          {cfg.label}
        </span>
      </div>
      <div>
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {task.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-clay-ink/65">
          Cerita: {task.story}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <span className="font-mono text-xs font-bold text-clay-ink/55">
          {task.dueLabel}
        </span>
        <button
          type="button"
          className="clay-sm bg-clay-rose px-4 py-2 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Kerjakan
        </button>
      </div>
    </article>
  );
}
