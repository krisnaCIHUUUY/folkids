import { ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  AssignmentManager,
  type AssignmentRow,
} from "@/components/guru/assignment-manager";

type EmbeddedTitle = { title: string } | { title: string }[] | null;
type EmbeddedName = { name: string } | { name: string }[] | null;

function pickTitle(rel: EmbeddedTitle): string {
  if (!rel) return "";
  return Array.isArray(rel) ? (rel[0]?.title ?? "") : rel.title;
}

function pickName(rel: EmbeddedName): string {
  if (!rel) return "";
  return Array.isArray(rel) ? (rel[0]?.name ?? "") : rel.name;
}

export default async function TugasPage() {
  const supabase = await createClient();

  // RLS membatasi: guru hanya melihat kelas/cerita/kuis/tugas miliknya.
  const [classesRes, storiesRes, quizzesRes, assignmentsRes] = await Promise.all([
    supabase.from("classes").select("id, name").order("name"),
    supabase.from("stories").select("id, title").order("title"),
    supabase.from("quizzes").select("id, title").order("title"),
    supabase
      .from("assignments")
      .select(
        "id, class_id, kind, title, instructions, due_at, classes(name), stories(title), quizzes(title)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const classes = (classesRes.data ?? []).map((c) => ({ id: c.id, name: c.name }));
  const stories = (storiesRes.data ?? []).map((s) => ({ id: s.id, title: s.title }));
  const quizzes = (quizzesRes.data ?? []).map((q) => ({ id: q.id, title: q.title }));

  const assignments: AssignmentRow[] = (assignmentsRes.data ?? []).map((a) => ({
    id: a.id,
    classId: a.class_id,
    className: pickName(a.classes) || "Kelas",
    kind: a.kind,
    title: a.title,
    instructions: a.instructions,
    contentTitle:
      a.kind === "baca" ? pickTitle(a.stories) : pickTitle(a.quizzes),
    dueAt: a.due_at,
  }));

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-blue text-white">
          <ClipboardList className="size-5" />
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          Tugas
        </h1>
      </div>
      <p className="mt-2 max-w-2xl font-semibold text-clay-ink/60">
        Beri tugas membaca cerita atau mengerjakan kuis ke kelasmu. Siswa otomatis
        menerima notifikasi saat tugas dibuat.
      </p>

      <div className="mt-6">
        <AssignmentManager
          classes={classes}
          stories={stories}
          quizzes={quizzes}
          assignments={assignments}
        />
      </div>
    </div>
  );
}
