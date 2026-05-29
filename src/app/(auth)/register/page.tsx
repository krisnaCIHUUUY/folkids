"use client";

import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { toast } from "sonner";

import {
  registerGuruSchema,
  type RegisterGuruValues,
} from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthShell } from "@/components/auth/auth-shell";
import { ClayInput } from "@/components/auth/clay-input";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const form = useForm<RegisterGuruValues>({
    resolver: zodResolver(registerGuruSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = useWatch({ control: form.control, name: "password" });

  function onSubmit(values: RegisterGuruValues) {
    console.log("register guru", values);
    toast.success("Akun dibuat (stub) — autentikasi belum tersambung");
  }

  return (
    <AuthShell
      title="Buat Akun Guru"
      subtitle="Daftar untuk mulai membuat cerita & asesmen."
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-black text-clay-rose hover:underline"
          >
            Masuk
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Nama Lengkap
                </FormLabel>
                <FormControl>
                  <ClayInput
                    autoComplete="name"
                    placeholder="Nama lengkapmu"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Email
                </FormLabel>
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">
                  Password
                </FormLabel>
                <FormControl>
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    {...field}
                  />
                </FormControl>
                <PasswordStrengthMeter value={password} />
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
                    placeholder="Ulangi password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "clay-sm mt-0.5 grid size-7 shrink-0 place-items-center transition",
                      field.value
                        ? "bg-clay-rose text-white"
                        : "bg-white text-transparent",
                    )}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </button>
                  <label
                    onClick={() => field.onChange(!field.value)}
                    className="cursor-pointer text-sm font-semibold text-clay-ink/80"
                  >
                    Saya menyetujui{" "}
                    <Link
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="font-black text-clay-rose hover:underline"
                    >
                      Syarat &amp; Ketentuan
                    </Link>
                  </label>
                </div>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={!form.formState.isValid}
            className="clay w-full bg-clay-rose px-7 py-4 text-base font-black text-white transition hover:[transform:translateY(-3px)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:[transform:none]"
          >
            Buat Akun
          </button>
        </form>
      </Form>
    </AuthShell>
  );
}
