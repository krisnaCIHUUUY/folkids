"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  BookOpen,
  ListChecks,
  Pencil,
  Trash2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

import { deleteAssignment } from "@/lib/actions/assignments";
import {
  AssignmentForm,
  type ClassOption,
  type PickerOption,
} from "@/components/guru/assignment-form";

export type AssignmentRow = {
  id: number;
  classId: number;
  className: string;
  kind: "baca" | "kuis";
  title: string;
  instructions: string | null;
  contentTitle: string;
  dueAt: string | null;
};

// Konversi ISO → nilai untuk <input type="datetime-local"> (waktu lokal).
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function formatDue(iso: string): { label: string; overdue: boolean } {
  const due = new Date(iso);
  const overdue = due.getTime() < Date.now();
  return {
    label: due.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    overdue,
  };
}

export function AssignmentManager({
  classes,
  stories,
  quizzes,
  assignments,
}: {
  classes: ClassOption[];
  stories: PickerOption[];
  quizzes: PickerOption[];
  assignments: AssignmentRow[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "create" | number>("list");
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number, title: string) {
    if (!confirm(`Hapus tugas "${title}"?`)) return;
    startTransition(async () => {
      const result = await deleteAssignment(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Tugas dihapus");
      router.refresh();
    });
  }

  const editing =
    typeof mode === "number" ? assignments.find((a) => a.id === mode) : undefined;

  return (
    <div>
      <div className="flex items-center justify-end">
        {mode === "list" && (
          <button
            type="button"
            onClick={() => setMode("create")}
            disabled={classes.length === 0}
            className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-50"
          >
            <Plus className="size-4" /> Buat Tugas
          </button>
        )}
      </div>

      {classes.length === 0 && mode === "list" && (
        <div className="clay mt-4 bg-white p-6 text-center font-semibold text-clay-ink/60">
          Buat kelas dulu sebelum memberi tugas.
        </div>
      )}

      {mode === "create" && (
        <AssignmentForm
          classes={classes}
          stories={stories}
          quizzes={quizzes}
          onDone={() => setMode("list")}
        />
      )}

      {editing && (
        <AssignmentForm
          classes={classes}
          stories={stories}
          quizzes={quizzes}
          assignmentId={editing.id}
          defaultValues={{
            classId: String(editing.classId),
            kind: editing.kind,
            storyId:
              editing.kind === "baca"
                ? String(
                    stories.find((s) => s.title === editing.contentTitle)?.id ?? "",
                  )
                : "",
            quizId:
              editing.kind === "kuis"
                ? String(
                    quizzes.find((q) => q.title === editing.contentTitle)?.id ?? "",
                  )
                : "",
            title: editing.title,
            instructions: editing.instructions ?? "",
            dueAt: editing.dueAt ? toLocalInput(editing.dueAt) : "",
          }}
          onDone={() => setMode("list")}
        />
      )}

      {mode === "list" && assignments.length > 0 && (
        <ul className="mt-4 space-y-3">
          {assignments.map((a) => {
            const due = a.dueAt ? formatDue(a.dueAt) : null;
            const Icon = a.kind === "baca" ? BookOpen : ListChecks;
            return (
              <li
                key={a.id}
                className="clay-sm flex flex-wrap items-start gap-3 bg-white p-4"
              >
                <span
                  className={`clay-sm grid size-9 shrink-0 place-items-center text-clay-ink ${
                    a.kind === "baca" ? "bg-clay-sun" : "bg-clay-sky"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-clay-ink">{a.title}</p>
                  <p className="mt-0.5 text-sm font-semibold text-clay-ink/60">
                    {a.className} · {a.kind === "baca" ? "Baca" : "Kuis"}:{" "}
                    {a.contentTitle}
                  </p>
                  {due && (
                    <p
                      className={`mt-1 inline-flex items-center gap-1 font-mono text-xs font-bold ${
                        due.overdue ? "text-clay-coral" : "text-clay-ink/55"
                      }`}
                    >
                      <CalendarClock className="size-3.5" />
                      {due.overdue ? "Lewat tenggat · " : "Tenggat: "}
                      {due.label}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode(a.id)}
                    aria-label="Edit tugas"
                    className="clay-sm grid size-9 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id, a.title)}
                    disabled={isPending}
                    aria-label="Hapus tugas"
                    className="clay-sm grid size-9 place-items-center bg-clay-coral/15 text-clay-coral transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mode === "list" && assignments.length === 0 && classes.length > 0 && (
        <div className="clay mt-4 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Belum ada tugas. Klik “Buat Tugas” untuk memberi tugas ke kelasmu.
        </div>
      )}
    </div>
  );
}
