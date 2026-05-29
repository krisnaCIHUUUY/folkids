"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { classSchema, type ClassFormValues } from "@/lib/validations/class";
import { createClass, updateClass } from "@/lib/actions/classes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GRADE_OPTIONS = [
  "Kelas 1",
  "Kelas 2",
  "Kelas 3",
  "Kelas 4",
  "Kelas 5",
  "Kelas 6",
];

export function ClassForm({
  classId,
  defaultValues,
}: {
  classId?: number;
  defaultValues?: Partial<ClassFormValues>;
}) {
  const router = useRouter();
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    mode: "onTouched",
    defaultValues: {
      name: defaultValues?.name ?? "",
      grade_level: defaultValues?.grade_level ?? "",
    },
  });

  async function onSubmit(values: ClassFormValues) {
    if (classId) {
      const result = await updateClass(classId, values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Perubahan tersimpan");
      router.push(`/kelas/${classId}`);
      router.refresh();
    } else {
      const result = await createClass(values);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Kelas dibuat");
      router.push(`/kelas/${result.id}`);
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="clay mt-6 space-y-5 bg-white p-6 md:p-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Nama Kelas
              </FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Kelas 4A — Literasi Pagi" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Tingkat Kelas
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kelas" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GRADE_OPTIONS.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {form.formState.isSubmitting
              ? "Menyimpan…"
              : classId
                ? "Simpan Perubahan"
                : "Buat Kelas"}
          </button>
          <button
            type="button"
            onClick={() => router.push(classId ? `/kelas/${classId}` : "/kelas")}
            className="clay-sm bg-white px-6 py-3 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            Batal
          </button>
        </div>
      </form>
    </Form>
  );
}
