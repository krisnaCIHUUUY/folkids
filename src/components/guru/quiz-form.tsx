"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { quizSchema, type QuizFormValues } from "@/lib/validations/quiz";
import { createQuiz, updateQuiz } from "@/lib/actions/quizzes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function QuizForm({
  storyId,
  quizId,
  defaultValues,
  onDone,
}: {
  storyId: number;
  quizId?: number;
  defaultValues?: Partial<QuizFormValues>;
  onDone: () => void;
}) {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    mode: "onTouched",
    defaultValues: {
      title: defaultValues?.title ?? "",
      time_limit_minutes: defaultValues?.time_limit_minutes ?? 0,
    },
  });

  async function onSubmit(values: QuizFormValues) {
    const result = quizId
      ? await updateQuiz(quizId, storyId, values)
      : await createQuiz(storyId, values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(quizId ? "Kuis tersimpan" : "Kuis ditambahkan");
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Judul Kuis
              </FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kuis Pemahaman — Bab 1" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time_limit_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Batas Waktu (menit)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription className="text-xs font-semibold text-clay-ink/55">
                Isi 0 untuk tanpa batas waktu.
              </FormDescription>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="clay-sm w-full bg-clay-rose py-3 text-sm font-black text-white transition active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Kuis"}
        </button>
      </form>
    </Form>
  );
}
