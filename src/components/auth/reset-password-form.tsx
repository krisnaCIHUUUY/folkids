"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  newPasswordSchema,
  type NewPasswordValues,
} from "@/lib/validations/auth";
import { updatePassword } from "@/lib/actions/auth";
import { PasswordInput } from "@/components/auth/password-input";
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

export function ResetPasswordForm() {
  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: NewPasswordValues) {
    // Sukses → server action melakukan redirect; hanya error yang kembali.
    const result = await updatePassword(values);
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Password Baru
              </FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Konfirmasi Password
              </FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Ulangi password baru"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button type="submit" disabled={form.formState.isSubmitting} className={submitClass}>
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Password Baru"}
        </button>
      </form>
    </Form>
  );
}
