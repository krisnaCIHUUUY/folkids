"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { joinClassSchema, type JoinClassFormValues } from "@/lib/validations/class";
import { joinClassByCode } from "@/lib/actions/classes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function JoinClassForm() {
  const router = useRouter();
  const form = useForm<JoinClassFormValues>({
    resolver: zodResolver(joinClassSchema),
    mode: "onTouched",
    defaultValues: { code: "" },
  });

  async function onSubmit(values: JoinClassFormValues) {
    const result = await joinClassByCode(values.code.trim().toUpperCase());
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(`Berhasil bergabung ke ${result.className}`);
    form.reset();
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="clay mt-6 space-y-5 bg-white p-6 md:p-8"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Kode Kelas
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: AB3K72"
                  autoCapitalize="characters"
                  className="font-mono text-lg font-black uppercase tracking-[0.3em]"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {form.formState.isSubmitting ? "Bergabung…" : "Gabung Kelas"}
        </button>
      </form>
    </Form>
  );
}
