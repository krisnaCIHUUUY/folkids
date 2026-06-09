"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createAssignment, updateAssignment } from "@/lib/actions/assignments";
import type { AssignmentFormValues } from "@/lib/validations/assignment";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PickerOption = { id: number; title: string };
export type ClassOption = { id: number; name: string };

// Bentuk form berbasis string (cocok dengan <Select>/<input>); dikonversi ke
// AssignmentFormValues saat submit (zod di server action yang memvalidasi final).
type FormShape = {
  classId: string;
  kind: "baca" | "kuis";
  storyId: string;
  quizId: string;
  title: string;
  instructions: string;
  dueAt: string;
};

export function AssignmentForm({
  classes,
  stories,
  quizzes,
  assignmentId,
  defaultValues,
  onDone,
}: {
  classes: ClassOption[];
  stories: PickerOption[];
  quizzes: PickerOption[];
  assignmentId?: number;
  defaultValues?: Partial<FormShape>;
  onDone?: () => void;
}) {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>({
    mode: "onTouched",
    defaultValues: {
      classId: defaultValues?.classId ?? (classes[0] ? String(classes[0].id) : ""),
      kind: defaultValues?.kind ?? "baca",
      storyId: defaultValues?.storyId ?? "",
      quizId: defaultValues?.quizId ?? "",
      title: defaultValues?.title ?? "",
      instructions: defaultValues?.instructions ?? "",
      dueAt: defaultValues?.dueAt ?? "",
    },
  });

  const kind = watch("kind");

  async function onSubmit(values: FormShape) {
    if (!values.classId) {
      toast.error("Pilih kelas terlebih dahulu");
      return;
    }
    if (values.kind === "baca" && !values.storyId) {
      toast.error("Pilih cerita untuk tugas membaca");
      return;
    }
    if (values.kind === "kuis" && !values.quizId) {
      toast.error("Pilih kuis untuk tugas kuis");
      return;
    }

    const payload: AssignmentFormValues = {
      classId: Number(values.classId),
      kind: values.kind,
      storyId: values.kind === "baca" ? Number(values.storyId) : undefined,
      quizId: values.kind === "kuis" ? Number(values.quizId) : undefined,
      title: values.title,
      instructions: values.instructions || undefined,
      dueAt: values.dueAt || undefined,
    };

    const result = assignmentId
      ? await updateAssignment(assignmentId, payload)
      : await createAssignment(payload);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(assignmentId ? "Tugas diperbarui" : "Tugas dibuat & dikirim ke siswa");
    router.refresh();
    onDone?.();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="clay mt-4 space-y-5 bg-white p-6"
    >
      {/* Kelas */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">Kelas</label>
        <Controller
          control={control}
          name="classId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Jenis tugas */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">Jenis Tugas</label>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baca">Membaca cerita</SelectItem>
                <SelectItem value="kuis">Mengerjakan kuis</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Konten: cerita atau kuis sesuai jenis */}
      {kind === "baca" ? (
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-clay-ink">Cerita</label>
          <Controller
            control={control}
            name="storyId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cerita" />
                </SelectTrigger>
                <SelectContent>
                  {stories.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {stories.length === 0 && (
            <p className="text-xs font-semibold text-clay-coral">
              Belum ada cerita. Buat cerita di menu Cerita dulu.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-clay-ink">Kuis</label>
          <Controller
            control={control}
            name="quizId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kuis" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((q) => (
                    <SelectItem key={q.id} value={String(q.id)}>
                      {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {quizzes.length === 0 && (
            <p className="text-xs font-semibold text-clay-coral">
              Belum ada kuis. Buat kuis di menu Asesmen/Cerita dulu.
            </p>
          )}
        </div>
      )}

      {/* Judul */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">Judul Tugas</label>
        <Input
          placeholder="Contoh: Baca 'Timun Mas' sebelum Jumat"
          {...register("title", { required: true })}
        />
        {errors.title && (
          <p className="text-xs font-semibold text-clay-coral">
            Judul tugas wajib diisi (min. 3 karakter).
          </p>
        )}
      </div>

      {/* Instruksi (opsional) */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">
          Instruksi <span className="font-normal text-clay-ink/50">(opsional)</span>
        </label>
        <Textarea
          placeholder="Petunjuk tambahan untuk siswa…"
          {...register("instructions")}
        />
      </div>

      {/* Tenggat (opsional) */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">
          Tenggat <span className="font-normal text-clay-ink/50">(opsional)</span>
        </label>
        <Input type="datetime-local" {...register("dueAt")} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {isSubmitting
            ? "Menyimpan…"
            : assignmentId
              ? "Simpan Perubahan"
              : "Buat & Kirim Tugas"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="clay-sm bg-white px-6 py-3 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
