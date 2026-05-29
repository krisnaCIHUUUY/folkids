"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  registerGuruSchema,
  registerSiswaSchema,
  type RegisterGuruValues,
  type RegisterSiswaValues,
} from "@/lib/validations/auth";
import { registerGuru, registerSiswa } from "@/lib/actions/auth";
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
import { RoleSelector, type AuthRole } from "@/components/auth/role-selector";
import { cn } from "@/lib/utils";

const submitClass =
  "clay w-full bg-clay-rose px-7 py-4 text-base font-black text-white transition hover:[transform:translateY(-3px)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:[transform:none]";

const SUBTITLE: Record<AuthRole, { title: string; subtitle: string }> = {
  siswa: {
    title: "Buat Akun Siswa",
    subtitle: "Daftar untuk mulai membaca cerita rakyat Nusantara!",
  },
  guru: {
    title: "Buat Akun Guru",
    subtitle: "Daftar untuk mulai membuat cerita & asesmen.",
  },
  admin: {
    title: "Akun Admin",
    subtitle: "Akun admin dibuat oleh sistem.",
  },
};

export default function RegisterPage() {
  const [role, setRole] = useState<AuthRole>("siswa");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Layar konfirmasi email (khusus guru, setelah signUp berhasil).
  if (submittedEmail) {
    return (
      <AuthShell
        title="Cek Email Kamu"
        subtitle="Satu langkah lagi untuk mengaktifkan akun."
        footer={
          <>
            Sudah konfirmasi?{" "}
            <Link href="/login" className="font-black text-clay-rose hover:underline">
              Masuk
            </Link>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="clay grid size-16 place-items-center bg-clay-mint text-white">
            <MailCheck className="size-8" />
          </span>
          <p className="font-semibold text-clay-ink/80">
            Kami mengirim tautan konfirmasi ke{" "}
            <span className="font-black text-clay-ink">{submittedEmail}</span>. Buka
            email tersebut untuk mengaktifkan akun gurumu.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={SUBTITLE[role].title}
      subtitle={SUBTITLE[role].subtitle}
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-black text-clay-rose hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <RoleSelector value={role} onChange={setRole} />
        {role === "siswa" && <SiswaRegisterForm />}
        {role === "guru" && <GuruRegisterForm onConfirm={setSubmittedEmail} />}
        {role === "admin" && (
          <div className="clay flex flex-col items-center gap-3 bg-white p-8 text-center">
            <span className="clay-sm grid size-12 place-items-center bg-clay-lavender text-clay-ink">
              <ShieldCheck className="size-6" />
            </span>
            <p className="font-semibold text-clay-ink/70">
              Akun admin tidak dapat didaftarkan sendiri. Hubungi pengelola sistem.
            </p>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

function SiswaRegisterForm() {
  const form = useForm<RegisterSiswaValues>({
    resolver: zodResolver(registerSiswaSchema),
    mode: "onTouched",
    defaultValues: { name: "", username: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterSiswaValues) {
    const result = await registerSiswa(values);
    // Sukses → server action melakukan redirect; hanya error yang kembali ke sini.
    if (result?.error) {
      toast.error(result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Nama Lengkap
              </FormLabel>
              <FormControl>
                <ClayInput autoComplete="name" placeholder="Nama lengkapmu" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Username
              </FormLabel>
              <FormControl>
                <ClayInput
                  autoComplete="username"
                  placeholder="Contoh: dinda_2024"
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
                  placeholder="Ulangi password"
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
          className={submitClass}
        >
          {form.formState.isSubmitting ? "Memproses…" : "Buat Akun"}
        </button>
      </form>
    </Form>
  );
}

function GuruRegisterForm({
  onConfirm,
}: {
  onConfirm: (email: string) => void;
}) {
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

  async function onSubmit(values: RegisterGuruValues) {
    const result = await registerGuru(values);
    // Sukses tanpa konfirmasi → server action melakukan redirect.
    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }
    if (result && "needsConfirmation" in result) {
      onConfirm(values.email);
      toast.success("Akun dibuat! Cek email untuk konfirmasi.");
    }
  }

  return (
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
                <ClayInput autoComplete="name" placeholder="Nama lengkapmu" {...field} />
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
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className={submitClass}
        >
          {form.formState.isSubmitting ? "Memproses…" : "Buat Akun"}
        </button>
      </form>
    </Form>
  );
}
