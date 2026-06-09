import { z } from "zod";

// Penugasan guru. `kind` menentukan konten yang ditunjuk: 'baca' → storyId,
// 'kuis' → quizId. `dueAt` opsional (string dari <input type="datetime-local">).
export const assignmentSchema = z
  .object({
    classId: z.coerce.number().int().positive("Kelas wajib dipilih"),
    kind: z.enum(["baca", "kuis"]),
    storyId: z.coerce.number().int().positive().optional(),
    quizId: z.coerce.number().int().positive().optional(),
    title: z
      .string()
      .min(3, "Judul tugas minimal 3 karakter")
      .max(120, "Judul tugas terlalu panjang"),
    instructions: z.string().max(1000, "Instruksi terlalu panjang").optional(),
    dueAt: z.string().optional(),
  })
  .refine((v) => (v.kind === "baca" ? !!v.storyId : true), {
    message: "Pilih cerita untuk tugas membaca",
    path: ["storyId"],
  })
  .refine((v) => (v.kind === "kuis" ? !!v.quizId : true), {
    message: "Pilih kuis untuk tugas kuis",
    path: ["quizId"],
  });

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

// Pengumuman ke satu kelas.
export const announcementSchema = z.object({
  classId: z.coerce.number().int().positive("Kelas wajib dipilih"),
  title: z
    .string()
    .min(3, "Judul pengumuman minimal 3 karakter")
    .max(120, "Judul terlalu panjang"),
  body: z.string().max(1000, "Isi pengumuman terlalu panjang").optional(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
