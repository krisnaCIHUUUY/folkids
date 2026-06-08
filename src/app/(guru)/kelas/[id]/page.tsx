import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Users, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassCodeCard } from "@/components/guru/class-code-card";
import { ClassRoster, type RosterStudent } from "@/components/guru/class-roster";
import { DeleteClassButton } from "@/components/guru/delete-class-button";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard/leaderboard-table";

export default async function KelasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classId = Number(id);
  if (!Number.isFinite(classId)) notFound();

  const supabase = await createClient();
  const { data: kelas } = await supabase
    .from("classes")
    .select("id, name, grade_level, code")
    .eq("id", classId)
    .maybeSingle();

  if (!kelas) notFound();

  // Roster & leaderboard independen → jalankan paralel.
  const [rosterRes, lbRes] = await Promise.all([
    supabase
      .from("class_students")
      .select("student_id, enrolled_at, users(name, email)")
      .eq("class_id", classId)
      .order("enrolled_at", { ascending: true }),
    supabase.rpc("class_leaderboard", { p_class_id: classId }),
  ]);
  const rosterRows = rosterRes.data;
  const leaderboard = (lbRes.data ?? []) as LeaderboardRow[];

  const students: RosterStudent[] = (rosterRows ?? []).map((r) => {
    // Supabase mengetik relasi embedded sebagai array; ambil elemen pertama.
    const u = (Array.isArray(r.users) ? r.users[0] : r.users) as
      | { name: string; email: string }
      | null;
    return {
      studentId: r.student_id,
      name: u?.name ?? "Siswa",
      email: u?.email ?? "",
      enrolledAt: r.enrolled_at,
    };
  });

  return (
    <div className="pt-6">
      <Link
        href="/kelas"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
            {kelas.name}
          </h1>
          <p className="mt-1 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
            {kelas.grade_level}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/kelas/${kelas.id}/edit`}
            className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Pencil className="size-4" /> Edit
          </Link>
          <DeleteClassButton classId={kelas.id} className={kelas.name} />
        </div>
      </div>

      <div className="mt-6">
        <ClassCodeCard classId={kelas.id} initialCode={kelas.code} />
      </div>

      <section className="mt-8">
        <div className="flex items-center gap-2.5">
          <span className="clay-sm grid size-9 place-items-center bg-clay-blue text-white">
            <Users className="size-4" />
          </span>
          <h2 className="font-serif text-xl font-bold text-clay-ink">
            Daftar Siswa{" "}
            <span className="font-mono text-base font-bold text-clay-ink/55">
              ({students.length})
            </span>
          </h2>
        </div>
        <ClassRoster classId={kelas.id} students={students} />
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="clay-sm grid size-9 place-items-center bg-clay-sun text-clay-ink">
            <Trophy className="size-4" />
          </span>
          <h2 className="font-serif text-xl font-bold text-clay-ink">
            Papan Peringkat
          </h2>
        </div>
        <p className="mt-1 text-sm font-semibold text-clay-ink/55">
          Poin Literasi = poin game + skor kuis + bonus cerita selesai.
        </p>
        <LeaderboardTable rows={leaderboard} />
      </section>
    </div>
  );
}
