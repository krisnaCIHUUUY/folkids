import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Users,
  Trophy,
  ClipboardList,
  BookOpen,
  ListChecks,
  CalendarClock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassCodeCard } from "@/components/guru/class-code-card";
import { ClassRoster, type RosterStudent } from "@/components/guru/class-roster";
import { DeleteClassButton } from "@/components/guru/delete-class-button";
import { AnnouncementForm } from "@/components/guru/announcement-form";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard/leaderboard-table";

type EmbeddedTitle = { title: string } | { title: string }[] | null;

function embeddedTitle(rel: EmbeddedTitle): string {
  if (!rel) return "";
  return Array.isArray(rel) ? (rel[0]?.title ?? "") : rel.title;
}

// Dibungkus di level modul agar tidak dianggap pemanggilan impur saat render.
const nowMs = () => Date.now();

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

  // Roster, leaderboard & tugas independen → jalankan paralel.
  const [rosterRes, lbRes, assignmentsRes] = await Promise.all([
    supabase
      .from("class_students")
      .select("student_id, enrolled_at, users(name, email)")
      .eq("class_id", classId)
      .order("enrolled_at", { ascending: true }),
    supabase.rpc("class_leaderboard", { p_class_id: classId }),
    supabase
      .from("assignments")
      .select("id, kind, title, due_at, stories(title), quizzes(title)")
      .eq("class_id", classId)
      .order("created_at", { ascending: false }),
  ]);
  const rosterRows = rosterRes.data;
  const leaderboard = (lbRes.data ?? []) as LeaderboardRow[];

  const assignments = (assignmentsRes.data ?? []).map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    contentTitle:
      a.kind === "baca" ? embeddedTitle(a.stories) : embeddedTitle(a.quizzes),
    dueAt: a.due_at,
  }));

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

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <span className="clay-sm grid size-9 place-items-center bg-clay-blue text-white">
            <ClipboardList className="size-4" />
          </span>
          <h2 className="font-serif text-xl font-bold text-clay-ink">
            Tugas Kelas{" "}
            <span className="font-mono text-base font-bold text-clay-ink/55">
              ({assignments.length})
            </span>
          </h2>
        </div>
        <p className="mt-1 text-sm font-semibold text-clay-ink/55">
          Kelola semua tugas di menu{" "}
          <Link href="/tugas" className="font-bold text-clay-rose hover:underline">
            Tugas
          </Link>
          .
        </p>

        {assignments.length === 0 ? (
          <div className="clay-inset mt-4 bg-white p-6 text-center font-semibold text-clay-ink/60">
            Belum ada tugas untuk kelas ini.
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {assignments.map((a) => {
              const Icon = a.kind === "baca" ? BookOpen : ListChecks;
              const due = a.dueAt ? new Date(a.dueAt) : null;
              const overdue = due ? due.getTime() < nowMs() : false;
              return (
                <li
                  key={a.id}
                  className="clay-sm flex items-center gap-3 bg-white p-3"
                >
                  <span
                    className={`clay-sm grid size-9 shrink-0 place-items-center text-clay-ink ${
                      a.kind === "baca" ? "bg-clay-sun" : "bg-clay-sky"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-clay-ink">{a.title}</p>
                    <p className="truncate text-sm font-semibold text-clay-ink/55">
                      {a.kind === "baca" ? "Baca" : "Kuis"}: {a.contentTitle}
                    </p>
                  </div>
                  {due && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 font-mono text-xs font-bold ${
                        overdue ? "text-clay-coral" : "text-clay-ink/55"
                      }`}
                    >
                      <CalendarClock className="size-3.5" />
                      {due.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <AnnouncementForm classId={kelas.id} />
      </section>
    </div>
  );
}
