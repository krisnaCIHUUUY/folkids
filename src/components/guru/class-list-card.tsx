import Link from "next/link";
import { Users, GraduationCap, ArrowRight } from "lucide-react";

export type ClassListData = {
  id: number;
  name: string;
  grade_level: string;
  code: string;
  studentCount: number;
};

export function ClassListCard({ data }: { data: ClassListData }) {
  return (
    <Link
      href={`/kelas/${data.id}`}
      className="clay-sm group flex flex-col gap-4 bg-white p-5 transition hover:[transform:translateY(-4px)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="clay-sm grid size-11 shrink-0 place-items-center bg-clay-blue text-white">
          <GraduationCap className="size-5" />
        </span>
        <span className="clay-inset rounded-lg bg-clay-cream px-3 py-1.5 font-mono text-sm font-black tracking-widest text-clay-ink">
          {data.code}
        </span>
      </div>

      <div>
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {data.name}
        </h3>
        <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
          {data.grade_level}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/70">
          <Users className="size-4" /> {data.studentCount} siswa
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-black text-clay-rose transition group-hover:gap-2">
          Kelola <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
