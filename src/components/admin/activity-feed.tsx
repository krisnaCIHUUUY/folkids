import { UserPlus, BookOpen, PencilLine, CheckCircle2, type LucideIcon } from "lucide-react";

export type ActivityKind = "user" | "cerita" | "kuis" | "baca";

export type ActivityItem = {
  kind: ActivityKind;
  text: string;
  time: string;
};

const KIND_STYLE: Record<ActivityKind, { icon: LucideIcon; bg: string }> = {
  user: { icon: UserPlus, bg: "bg-clay-lavender" },
  cerita: { icon: BookOpen, bg: "bg-clay-coral" },
  kuis: { icon: PencilLine, bg: "bg-clay-mint" },
  baca: { icon: CheckCircle2, bg: "bg-clay-sky" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-bold tracking-tight text-clay-ink md:text-2xl">
        Aktivitas Sistem Terbaru
      </h2>
      <p className="mt-1 font-semibold text-clay-ink/60">
        Pendaftaran pengguna, unggahan cerita, dan aktivitas belajar terkini.
      </p>

      {items.length === 0 ? (
        <div className="clay mt-4 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Belum ada aktivitas.
        </div>
      ) : (
        <ul className="clay mt-4 divide-y divide-clay-ink/5 bg-white p-2">
          {items.map((item, idx) => {
            const { icon: Icon, bg } = KIND_STYLE[item.kind];
            return (
              <li key={idx} className="flex items-center gap-4 px-3 py-3">
                <span className={`clay-sm grid size-10 shrink-0 place-items-center text-white ${bg}`}>
                  <Icon className="size-5" />
                </span>
                <p className="min-w-0 flex-1 font-semibold text-clay-ink">{item.text}</p>
                <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/45">
                  {item.time}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
