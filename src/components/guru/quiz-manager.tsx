"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ListChecks, Clock, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { deleteQuiz } from "@/lib/actions/quizzes";
import { QuizForm } from "@/components/guru/quiz-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type QuizData = {
  id: number;
  title: string;
  time_limit_minutes: number;
  questionCount: number;
};

export function QuizManager({
  storyId,
  quizzes,
}: {
  storyId: number;
  quizzes: QuizData[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QuizData | null>(null);
  const [toDelete, setToDelete] = useState<QuizData | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(quiz: QuizData) {
    setEditing(quiz);
    setFormOpen(true);
  }

  function handleDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      const result = await deleteQuiz(id, storyId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Kuis dihapus");
      setToDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={openAdd}
        className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Plus className="size-4" /> Tambah Kuis
      </button>

      {quizzes.length === 0 ? (
        <div className="clay-inset mt-5 bg-clay-cream p-8 text-center">
          <p className="font-semibold text-clay-ink/60">
            Belum ada kuis. Tambahkan kuis pertama untuk cerita ini.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="clay-sm flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center"
            >
              <span className="clay-sm grid size-10 shrink-0 place-items-center bg-clay-sun text-clay-ink">
                <ListChecks className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
                  {quiz.title}
                </h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs font-bold text-clay-ink/55">
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="size-3.5" /> {quiz.questionCount} soal
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {quiz.time_limit_minutes > 0
                      ? `${quiz.time_limit_minutes} menit`
                      : "Tanpa batas"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/cms/${storyId}/kuis/${quiz.id}`}
                  className="clay-sm inline-flex items-center gap-1.5 bg-clay-rose px-3 py-2 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
                >
                  <ListChecks className="size-4" /> Kelola Soal
                </Link>
                <button
                  type="button"
                  aria-label="Edit kuis"
                  onClick={() => openEdit(quiz)}
                  className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
                >
                  <Pencil className="size-4" /> Edit
                </button>
                <button
                  type="button"
                  aria-label="Hapus kuis"
                  onClick={() => setToDelete(quiz)}
                  className="clay-sm grid size-9 place-items-center bg-white text-clay-coral transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Dialog buat/edit kuis */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Kuis" : "Tambah Kuis"}</DialogTitle>
          </DialogHeader>
          <QuizForm
            storyId={storyId}
            quizId={editing?.id}
            defaultValues={
              editing
                ? {
                    title: editing.title,
                    time_limit_minutes: editing.time_limit_minutes,
                  }
                : undefined
            }
            onDone={() => {
              setFormOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog konfirmasi hapus */}
      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus kuis?</DialogTitle>
            <DialogDescription>
              Kuis &ldquo;{toDelete?.title}&rdquo; beserta semua soalnya akan dihapus
              permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="clay-sm bg-white px-4 py-2 text-sm font-black text-clay-ink">
              Batal
            </DialogClose>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="clay-sm bg-clay-coral px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {pending ? "Menghapus…" : "Hapus"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
