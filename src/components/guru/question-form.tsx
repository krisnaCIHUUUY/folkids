"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Check } from "lucide-react";

import {
  questionFormSchema,
  toQuestionPayload,
  QUESTION_TYPES,
  QUESTION_TYPE_LABEL,
  type QuestionFormValues,
} from "@/lib/validations/quiz";
import { createQuestion, updateQuestion } from "@/lib/actions/quizzes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const EMPTY_QUESTION: QuestionFormValues = {
  question_text: "",
  question_type: "pilihan_ganda",
  score_weight: 1,
  choices: [{ value: "" }, { value: "" }],
  correctIndex: null,
  boolAnswer: null,
  isianAnswer: "",
  pairs: [
    { left: "", right: "" },
    { left: "", right: "" },
  ],
};

export function QuestionForm({
  storyId,
  quizId,
  questionId,
  defaultValues,
  onDone,
}: {
  storyId: number;
  quizId: number;
  questionId?: number;
  defaultValues?: QuestionFormValues;
  onDone: () => void;
}) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    mode: "onTouched",
    defaultValues: defaultValues ?? EMPTY_QUESTION,
  });

  const type = form.watch("question_type");
  const correctIndex = form.watch("correctIndex");
  const boolAnswer = form.watch("boolAnswer");

  const choices = useFieldArray({ control: form.control, name: "choices" });
  const pairs = useFieldArray({ control: form.control, name: "pairs" });

  // Pastikan field array punya isi minimal saat berpindah ke tipe terkait.
  useEffect(() => {
    if (type === "pilihan_ganda" && choices.fields.length === 0) {
      choices.replace([{ value: "" }, { value: "" }]);
    }
    if (type === "mencocokkan" && pairs.fields.length === 0) {
      pairs.replace([
        { left: "", right: "" },
        { left: "", right: "" },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function removeChoice(idx: number) {
    if (correctIndex === idx) {
      form.setValue("correctIndex", null);
    } else if (correctIndex !== null && idx < correctIndex) {
      form.setValue("correctIndex", correctIndex - 1);
    }
    choices.remove(idx);
  }

  async function onSubmit(values: QuestionFormValues) {
    const payload = toQuestionPayload(values);
    const result = questionId
      ? await updateQuestion(questionId, quizId, storyId, payload)
      : await createQuestion(quizId, storyId, payload);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(questionId ? "Soal tersimpan" : "Soal ditambahkan");
    onDone();
  }

  function onInvalid() {
    toast.error("Periksa kembali isian soal yang ditandai merah.");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Pertanyaan
              </FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Tulis pertanyaan di sini" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="question_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Tipe Soal
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe soal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {QUESTION_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        {/* ===== Pilihan Ganda ===== */}
        {type === "pilihan_ganda" && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-clay-ink">
              Opsi Jawaban{" "}
              <span className="font-semibold text-clay-ink/55">
                (klik lingkaran untuk menandai jawaban benar)
              </span>
            </p>
            {choices.fields.map((f, idx) => (
              <div key={f.id} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Tandai opsi ${idx + 1} sebagai benar`}
                  onClick={() => form.setValue("correctIndex", idx, { shouldValidate: true })}
                  className={`clay-sm grid size-9 shrink-0 place-items-center transition ${
                    correctIndex === idx
                      ? "bg-clay-mint text-white"
                      : "bg-white text-clay-ink/40"
                  }`}
                >
                  <Check className="size-4" />
                </button>
                <Input
                  placeholder={`Opsi ${idx + 1}`}
                  {...form.register(`choices.${idx}.value` as const)}
                />
                <button
                  type="button"
                  aria-label="Hapus opsi"
                  disabled={choices.fields.length <= 2}
                  onClick={() => removeChoice(idx)}
                  className="clay-sm grid size-9 shrink-0 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {form.formState.errors.choices && (
              <p className="text-sm font-semibold text-clay-coral">
                {form.formState.errors.choices.message}
              </p>
            )}
            {form.formState.errors.correctIndex && (
              <p className="text-sm font-semibold text-clay-coral">
                {form.formState.errors.correctIndex.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => choices.append({ value: "" })}
              className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition active:[transform:translateY(2px)]"
            >
              <Plus className="size-4" /> Tambah Opsi
            </button>
          </div>
        )}

        {/* ===== Benar / Salah ===== */}
        {type === "benar_salah" && (
          <div className="space-y-2">
            <p className="text-sm font-bold text-clay-ink">Jawaban Benar</p>
            <div className="flex gap-3">
              {(["benar", "salah"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => form.setValue("boolAnswer", opt, { shouldValidate: true })}
                  className={`clay-sm flex-1 py-3 text-sm font-black capitalize transition ${
                    boolAnswer === opt
                      ? "bg-clay-mint text-white"
                      : "bg-white text-clay-ink"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {form.formState.errors.boolAnswer && (
              <p className="text-sm font-semibold text-clay-coral">
                {form.formState.errors.boolAnswer.message}
              </p>
            )}
          </div>
        )}

        {/* ===== Isian Singkat ===== */}
        {type === "isian" && (
          <FormField
            control={form.control}
            name="isianAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Jawaban Benar
                </FormLabel>
                <FormControl>
                  <Input placeholder="Jawaban yang diharapkan" {...field} />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />
        )}

        {/* ===== Mencocokkan ===== */}
        {type === "mencocokkan" && (
          <div className="space-y-3">
            <p className="text-sm font-bold text-clay-ink">
              Pasangan{" "}
              <span className="font-semibold text-clay-ink/55">(kiri ↔ kanan)</span>
            </p>
            {pairs.fields.map((f, idx) => (
              <div key={f.id} className="flex items-center gap-2">
                <Input
                  placeholder="Kiri"
                  {...form.register(`pairs.${idx}.left` as const)}
                />
                <span className="shrink-0 font-black text-clay-ink/40">↔</span>
                <Input
                  placeholder="Kanan"
                  {...form.register(`pairs.${idx}.right` as const)}
                />
                <button
                  type="button"
                  aria-label="Hapus pasangan"
                  disabled={pairs.fields.length <= 2}
                  onClick={() => pairs.remove(idx)}
                  className="clay-sm grid size-9 shrink-0 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            {form.formState.errors.pairs && (
              <p className="text-sm font-semibold text-clay-coral">
                {form.formState.errors.pairs.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => pairs.append({ left: "", right: "" })}
              className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition active:[transform:translateY(2px)]"
            >
              <Plus className="size-4" /> Tambah Pasangan
            </button>
          </div>
        )}

        <FormField
          control={form.control}
          name="score_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Bobot Skor
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="clay-sm w-full bg-clay-rose py-3 text-sm font-black text-white transition active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Soal"}
        </button>
      </form>
    </Form>
  );
}
