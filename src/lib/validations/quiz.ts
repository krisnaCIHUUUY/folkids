import { z } from "zod";

// =========================
// Kuis (tabel quizzes)
// =========================
export const quizSchema = z.object({
  title: z.string().min(3, "Judul kuis minimal 3 karakter").max(150, "Judul terlalu panjang"),
  time_limit_minutes: z
    .number({ error: "Batas waktu harus angka" })
    .int("Batas waktu harus bilangan bulat")
    .min(0, "Batas waktu tidak boleh negatif")
    .max(600, "Batas waktu terlalu besar"),
});
export type QuizFormValues = z.infer<typeof quizSchema>;

// =========================
// Tipe soal
// =========================
export const QUESTION_TYPES = [
  "pilihan_ganda",
  "benar_salah",
  "isian",
  "mencocokkan",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  pilihan_ganda: "Pilihan Ganda",
  benar_salah: "Benar / Salah",
  isian: "Isian Singkat",
  mencocokkan: "Mencocokkan",
};

// =========================
// Payload soal yang disimpan ke DB (dipakai server action)
// options disimpan sebagai jsonb, correct_answer sebagai text.
// Untuk 'mencocokkan', correct_answer berisi JSON string pasangan kanonik.
// =========================
export const matchPairSchema = z.object({
  left: z.string().min(1, "Sisi kiri wajib diisi"),
  right: z.string().min(1, "Sisi kanan wajib diisi"),
});
export type MatchPair = z.infer<typeof matchPairSchema>;

export const quizQuestionPayloadSchema = z
  .object({
    question_text: z.string().min(3, "Pertanyaan minimal 3 karakter"),
    question_type: z.enum(QUESTION_TYPES),
    options: z.union([z.array(z.string()), z.array(matchPairSchema), z.null()]),
    correct_answer: z.string().min(1, "Jawaban benar wajib diisi"),
    score_weight: z.coerce
      .number()
      .int("Bobot harus bilangan bulat")
      .min(1, "Bobot minimal 1")
      .max(100, "Bobot terlalu besar"),
  })
  .superRefine((val, ctx) => {
    switch (val.question_type) {
      case "pilihan_ganda": {
        const opts = val.options;
        if (!Array.isArray(opts) || opts.some((o) => typeof o !== "string")) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Opsi tidak valid", path: ["options"] });
          return;
        }
        const strings = opts as string[];
        if (strings.length < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Minimal 2 opsi", path: ["options"] });
        }
        if (strings.some((o) => o.trim() === "")) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Opsi tidak boleh kosong", path: ["options"] });
        }
        if (!strings.includes(val.correct_answer)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tandai salah satu opsi sebagai jawaban benar",
            path: ["correct_answer"],
          });
        }
        break;
      }
      case "benar_salah": {
        if (val.correct_answer !== "benar" && val.correct_answer !== "salah") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pilih Benar atau Salah",
            path: ["correct_answer"],
          });
        }
        break;
      }
      case "isian": {
        if (val.correct_answer.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jawaban wajib diisi",
            path: ["correct_answer"],
          });
        }
        break;
      }
      case "mencocokkan": {
        const opts = val.options;
        const pairs = z.array(matchPairSchema).safeParse(opts);
        if (!pairs.success || pairs.data.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Minimal 2 pasangan yang lengkap",
            path: ["options"],
          });
        }
        break;
      }
    }
  });
export type QuizQuestionPayload = z.infer<typeof quizQuestionPayloadSchema>;

// =========================
// Bentuk form (rich) untuk react-hook-form.
// Field tipe-spesifik dipisah agar UI mudah; di-transform jadi payload saat submit.
// =========================
export const questionFormSchema = z
  .object({
    question_text: z.string().min(3, "Pertanyaan minimal 3 karakter"),
    question_type: z.enum(QUESTION_TYPES),
    score_weight: z
      .number({ error: "Bobot harus angka" })
      .int("Bobot harus bilangan bulat")
      .min(1, "Bobot minimal 1")
      .max(100, "Bobot terlalu besar"),
    // pilihan_ganda
    choices: z.array(z.object({ value: z.string() })),
    correctIndex: z.number().int().nullable(),
    // benar_salah
    boolAnswer: z.enum(["benar", "salah"]).nullable(),
    // isian
    isianAnswer: z.string(),
    // mencocokkan
    pairs: z.array(matchPairSchema.partial()),
  })
  .superRefine((val, ctx) => {
    switch (val.question_type) {
      case "pilihan_ganda": {
        const filled = val.choices.filter((c) => c.value.trim() !== "");
        if (filled.length < 2) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Isi minimal 2 opsi", path: ["choices"] });
        }
        if (
          val.correctIndex === null ||
          val.correctIndex < 0 ||
          val.correctIndex >= val.choices.length ||
          val.choices[val.correctIndex]?.value.trim() === ""
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tandai satu opsi sebagai jawaban benar",
            path: ["correctIndex"],
          });
        }
        break;
      }
      case "benar_salah": {
        if (val.boolAnswer === null) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pilih Benar atau Salah", path: ["boolAnswer"] });
        }
        break;
      }
      case "isian": {
        if (val.isianAnswer.trim() === "") {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Jawaban wajib diisi", path: ["isianAnswer"] });
        }
        break;
      }
      case "mencocokkan": {
        const complete = val.pairs.filter(
          (p) => (p.left ?? "").trim() !== "" && (p.right ?? "").trim() !== "",
        );
        if (complete.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Lengkapi minimal 2 pasangan",
            path: ["pairs"],
          });
        }
        break;
      }
    }
  });
export type QuestionFormValues = z.infer<typeof questionFormSchema>;

// Transform bentuk form → payload DB.
export function toQuestionPayload(values: QuestionFormValues): QuizQuestionPayload {
  const base = {
    question_text: values.question_text.trim(),
    question_type: values.question_type,
    score_weight: values.score_weight,
  };
  switch (values.question_type) {
    case "pilihan_ganda": {
      const options = values.choices.map((c) => c.value.trim()).filter((v) => v !== "");
      const correct =
        values.correctIndex !== null ? values.choices[values.correctIndex]?.value.trim() ?? "" : "";
      return { ...base, options, correct_answer: correct };
    }
    case "benar_salah":
      return { ...base, options: null, correct_answer: values.boolAnswer ?? "" };
    case "isian":
      return { ...base, options: null, correct_answer: values.isianAnswer.trim() };
    case "mencocokkan": {
      const pairs = values.pairs
        .filter((p) => (p.left ?? "").trim() !== "" && (p.right ?? "").trim() !== "")
        .map((p) => ({ left: (p.left ?? "").trim(), right: (p.right ?? "").trim() }));
      return { ...base, options: pairs, correct_answer: JSON.stringify(pairs) };
    }
  }
}
