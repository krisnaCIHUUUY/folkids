"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  loginGuruAdminSchema,
  loginSiswaSchema,
  type LoginGuruAdminValues,
  type LoginSiswaValues,
} from "@/lib/validations/auth";
import { loginGuruAdmin } from "@/lib/actions/auth";
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
import { RoleSelector, type AuthRole } from "@/components/auth/role-selector";

const submitClass =
  "clay w-full bg-clay-rose px-7 py-4 text-base font-black text-white transition hover:[transform:translateY(-3px)] disabled:opacity-60";

export default function LoginPage() {
  const [role, setRole] = useState<AuthRole>("siswa");

  return (
    <AuthShell title="Masuk" subtitle="Selamat datang kembali di Wayang Folkids!">
      <div className="space-y-6">
        <RoleSelector value={role} onChange={setRole} />
        {role === "siswa" ? (
          <SiswaLoginForm />
        ) : (
          <GuruAdminLoginForm role={role} />
        )}
      </div>
    </AuthShell>
  );
}

function GuruAdminLoginForm({ role }: { role: Exclude<AuthRole, "siswa"> }) {
  const form = useForm<LoginGuruAdminValues>({
    resolver: zodResolver(loginGuruAdminSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginGuruAdminValues) {
    const result = await loginGuruAdmin(values);
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
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-clay-coral" />
              <div className="text-right">
                <Link
                  href="#"
                  className="text-xs font-bold text-clay-rose hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className={submitClass}
        >
          {form.formState.isSubmitting ? "Memproses…" : "Masuk"}
        </button>

        {role === "guru" && (
          <p className="text-center text-sm font-semibold text-clay-ink/70">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-black text-clay-rose hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
}

function SiswaLoginForm() {
  const form = useForm<LoginSiswaValues>({
    resolver: zodResolver(loginSiswaSchema),
    mode: "onTouched",
    defaultValues: { classCode: "", username: "" },
  });

  function onSubmit(values: LoginSiswaValues) {
    console.log("login siswa", values);
    toast.success("Masuk (stub) — autentikasi belum tersambung");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="classCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">
                Kode Kelas
              </FormLabel>
              <FormControl>
                <ClayInput placeholder="Contoh: 4A-WAYANG" {...field} />
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
                <ClayInput placeholder="Nama panggilanmu" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        <button type="submit" className={submitClass}>
          Masuk
        </button>
      </form>
    </Form>
  );
}
