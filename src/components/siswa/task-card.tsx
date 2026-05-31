import Link from "next/link";
import { PlayCircle, ListChecks } from "lucide-react";

export type StudentTask = {
  id: string;
  kind: "baca" | "kuis";
  storyTitle: string;
  href: string;
};

const KIND_CONFIG = {
  baca: {
    border: "border-l-clay-sun",
    pill: "bg-clay-sun text-clay-ink",
    label: "Lanjutkan membaca",
    icon: PlayCircle,
    action: "Lanjutkan",
    heading: "Lanjutkan Membaca",
  },
  kuis: {
    border: "border-l-clay-blue",
    pill: "bg-clay-sky text-clay-ink",
    label: "Belum dikerjakan",
    icon: ListChecks,
    action: "Kerjakan",
    heading: "Kerjakan Kuis",
  },
} as const;

export function TaskCard({ task }: { task: StudentTask }) {
  const cfg = KIND_CONFIG[task.kind];
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
          {cfg.heading}
        </h3>
        <p className="mt-1 text-sm font-semibold text-clay-ink/65">
          Cerita: {task.storyTitle}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-end pt-2">
        <Link
          href={task.href}
          className="clay-sm bg-clay-rose px-4 py-2 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          {cfg.action}
        </Link>
      </div>
    </article>
  );
}
