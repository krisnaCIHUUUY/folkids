import { Users, ClipboardList, Clock, UserPlus } from "lucide-react";
import type { ClassSummary, ClassAccent } from "@/lib/mock/guru-dashboard";
import { CopyableCode } from "@/components/guru/copyable-code";

const ACCENT_BORDER: Record<ClassAccent, string> = {
  sky: "border-l-clay-sky",
  blue: "border-l-clay-blue",
  lavender: "border-l-clay-lavender",
};

export function ClassCard({ data }: { data: ClassSummary }) {
  if (data.isEmpty) {
    return (
      <article
        className={`clay-sm flex flex-col gap-3 border-l-8 bg-white p-5 transition hover:[transform:translateY(-4px)] ${ACCENT_BORDER[data.accent]}`}
      >
        <h3 className="font-serif text-lg font-bold text-clay-ink">
          {data.name}
        </h3>
        <div className="clay-inset flex flex-col items-center gap-2 bg-clay-cream p-5 text-center">
          <span className="clay-sm grid size-12 place-items-center bg-clay-lavender text-white">
            <UserPlus className="size-6" />
          </span>
          <p className="text-sm font-bold text-clay-ink">Belum ada siswa</p>
          <p className="text-xs font-semibold text-clay-ink/60">
            Bagikan kode kelas di bawah agar siswa bisa bergabung.
          </p>
          <CopyableCode code={data.code} />
        </div>
        <button
          type="button"
          className="clay-sm w-full bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Kelola Kelas
        </button>
      </article>
    );
  }

  return (
    <article
      className={`clay-sm flex flex-col gap-3 border-l-8 bg-white p-5 transition hover:[transform:translateY(-4px)] ${ACCENT_BORDER[data.accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {data.name}
        </h3>
        <CopyableCode code={data.code} />
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs font-bold text-clay-ink/65">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-4" /> {data.studentCount} siswa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="size-4" /> {data.activeTasks} tugas aktif
        </span>
      </div>
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-ink/55">
        <Clock className="size-3.5" /> {data.lastActivity}
      </p>

      <div className="mt-auto flex gap-2 pt-2">
        <button
          type="button"
          className="clay-sm flex-1 bg-clay-rose py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Kelola Kelas
        </button>
        <button
          type="button"
          className="clay-sm flex-1 bg-white py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Bagikan Kode
        </button>
      </div>
    </article>
  );
}
