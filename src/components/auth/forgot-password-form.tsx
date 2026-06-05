"use client";

import { useState } from "react";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth";
import { requestPasswordReset } from "@/lib/actions/auth";
import { ClayInput } from "@/components/auth/clay-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const submitClass =
  "clay w-full bg-clay-rose px-7 py-4 text-base font-black text-white transition hover:[transform:translateY(-3px)] disabled:opacity-60";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    const result = await requestPasswordReset(values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="clay-sm grid size-14 place-items-center bg-clay-mint text-clay-ink">
          <MailCheck className="size-7" />
        </span>
        <p className="font-semibold text-clay-ink/80">
          Jika email tersebut terdaftar, kami telah mengirim tautan untuk
          mereset password. Periksa kotak masuk dan folder spam-mu.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">Email</FormLabel>
              <FormControl>
                <ClayInput
                  type="email"
                  autoComplete="email"
                  placeholder="nama@sekolah.id"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button type="submit" disabled={form.formState.isSubmitting} className={submitClass}>
          {form.formState.isSubmitting ? "Mengirim…" : "Kirim Tautan Reset"}
        </button>
      </form>
    </Form>
  );
}
