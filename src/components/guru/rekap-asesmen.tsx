"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { WayangAccent } from "@/components/wayang-accent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export type RekapClass = { id: number; name: string };
export type RekapQuiz = { id: number; title: string };
export type RekapMember = { classId: number; studentId: string; name: string };
export type RekapAttempt = { studentId: string; quizId: number; pct: number };

function scoreClass(pct: number) {
  return pct >= 60 ? "bg-clay-mint text-clay-ink" : "bg-clay-coral text-white";
}

export function RekapAsesmen({
  classes,
  quizzes,
  members,
  attempts,
}: {
  classes: RekapClass[];
  quizzes: RekapQuiz[];
  members: RekapMember[];
  attempts: RekapAttempt[];
}) {
  const [classId, setClassId] = useState<number | null>(classes[0]?.id ?? null);

  // Nilai per (siswa, kuis).
  const scoreOf = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of attempts) m.set(`${a.studentId}:${a.quizId}`, a.pct);
    return m;
  }, [attempts]);

  const students = useMemo(() => {
    if (classId === null) return [];
    const seen = new Set<string>();
    const out: { id: string; name: string }[] = [];
    for (const mem of members) {
      if (mem.classId === classId && !seen.has(mem.studentId)) {
        seen.add(mem.studentId);
        out.push({ id: mem.studentId, name: mem.name });
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [members, classId]);

  // Rata-rata per kuis (kolom) untuk siswa kelas terpilih.
  const quizAvg = useMemo(() => {
    const ids = new Set(students.map((s) => s.id));
    return quizzes.map((q) => {
      const vals = attempts
        .filter((a) => a.quizId === q.id && ids.has(a.studentId))
        .map((a) => a.pct);
      return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
    });
  }, [quizzes, attempts, students]);

  const studentAvg = (studentId: string): number | null => {
    const vals = quizzes
      .map((q) => scoreOf.get(`${studentId}:${q.id}`))
      .filter((v): v is number => v !== undefined);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center overflow-hidden">
          <WayangAccent className="absolute inset-0 h-full w-full text-clay-lavender/30" />
          <span className="clay-sm relative grid size-10 place-items-center bg-clay-lavender text-clay-ink">
            <ClipboardList className="size-5" />
          </span>
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          Rekap Asesmen
        </h1>
      </div>
      <p className="mt-2 font-semibold text-clay-ink/60">
        Nilai tiap siswa per kuis. Klik nilai untuk melihat rincian jawaban per soal.
      </p>

      {classes.length === 0 ? (
        <EmptyCard text="Belum ada kelas. Buat kelas terlebih dahulu untuk melihat rekap." />
      ) : quizzes.length === 0 ? (
        <EmptyCard text="Belum ada kuis. Buat kuis di cerita untuk mulai menilai." />
      ) : (
        <div className="mt-5">
          <div className="mb-4 max-w-xs">
            <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
              Kelas
            </p>
            <Select
              value={classId === null ? "" : String(classId)}
              onValueChange={(v) => setClassId(Number(v))}
            >
              <SelectTrigger className="h-10 w-full bg-clay-cream">
                {classes.find((c) => c.id === classId)?.name ?? "Pilih kelas"}
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {students.length === 0 ? (
            <EmptyCard text="Belum ada siswa di kelas ini. Bagikan kode kelas agar siswa bergabung." />
          ) : (
            <div className="clay overflow-x-auto bg-white p-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                      Siswa
                    </th>
                    {quizzes.map((q) => (
                      <th
                        key={q.id}
                        className="min-w-[110px] px-3 py-3 text-center font-bold text-clay-ink"
                      >
                        {q.title}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                      Rata-rata
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const avg = studentAvg(s.id);
                    return (
                      <tr key={s.id} className="border-t border-clay-ink/5">
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 font-bold text-clay-ink">
                          {s.name}
                        </td>
                        {quizzes.map((q) => {
                          const pct = scoreOf.get(`${s.id}:${q.id}`);
                          return (
                            <td key={q.id} className="px-3 py-2 text-center">
                              {pct === undefined ? (
                                <span className="font-mono text-clay-ink/30">—</span>
                              ) : (
                                <Link
                                  href={`/asesmen/${q.id}/${s.id}`}
                                  className={`clay-sm inline-flex min-w-[52px] items-center justify-center px-2.5 py-1.5 font-mono text-sm font-black transition hover:[transform:translateY(-2px)] active:[transform:translateY(1px)] ${scoreClass(pct)}`}
                                >
                                  {pct}%
                                </Link>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center font-mono font-black text-clay-ink">
                          {avg === null ? "—" : `${avg}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-clay-ink/10">
                    <td className="sticky left-0 z-10 bg-white px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
                      Rata-rata kuis
                    </td>
                    {quizAvg.map((v, i) => (
                      <td
                        key={quizzes[i].id}
                        className="px-3 py-2 text-center font-mono font-black text-clay-ink"
                      >
                        {v === null ? "—" : `${v}%`}
                      </td>
                    ))}
                    <td className="px-3 py-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="clay mt-5 bg-white p-8 text-center font-semibold text-clay-ink/60">
      {text}
    </div>
  );
}
