import Link from "next/link";
import { PlayCircle, ListChecks, CheckCircle2, CalendarClock } from "lucide-react";

export type StudentTask = {
  id: string;
  kind: "baca" | "kuis";
  title: string;
  contentTitle: string;
  href: string;
  dueAt: string | null;
  done: boolean;
};

const KIND_CONFIG = {
  baca: {
    border: "border-l-clay-sun",
    pill: "bg-clay-sun text-clay-ink",
    label: "Membaca",
    icon: PlayCircle,
    action: "Baca",
  },
  kuis: {
    border: "border-l-clay-blue",
    pill: "bg-clay-sky text-clay-ink",
    label: "Kuis",
    icon: ListChecks,
    action: "Kerjakan",
  },
} as const;

function dueInfo(iso: string): { label: string; overdue: boolean } {
  const due = new Date(iso);
  return {
    label: due.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    overdue: due.getTime() < Date.now(),
  };
}

export function TaskCard({ task }: { task: StudentTask }) {
  const cfg = KIND_CONFIG[task.kind];
  const Icon = cfg.icon;
  const due = task.dueAt ? dueInfo(task.dueAt) : null;

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
        {task.done ? (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-mint">
            <CheckCircle2 className="size-3.5" /> Selesai
          </span>
        ) : (
          due && (
            <span
              className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                due.overdue ? "text-clay-coral" : "text-clay-ink/55"
              }`}
            >
              <CalendarClock className="size-3.5" />
              {due.overdue ? "Lewat " : ""}
              {due.label}
            </span>
          )
        )}
      </div>
      <div>
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {task.title}
        </h3>
        <p className="mt-1 text-sm font-semibold text-clay-ink/65">
          {task.kind === "baca" ? "Cerita" : "Kuis"}: {task.contentTitle}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-end pt-2">
        <Link
          href={task.href}
          className={`clay-sm px-4 py-2 text-sm font-black transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] ${
            task.done
              ? "bg-clay-cream text-clay-ink/70"
              : "bg-clay-rose text-white"
          }`}
        >
          {task.done ? "Lihat" : cfg.action}
        </Link>
      </div>
    </article>
  );
}
