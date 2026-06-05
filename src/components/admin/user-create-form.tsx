"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createUser } from "@/lib/actions/admin-users";
import { ClayInput } from "@/components/auth/clay-input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z
  .object({
    role: z.enum(["guru", "siswa"]),
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().optional(),
    username: z.string().optional(),
    password: z.string().min(6, "Password minimal 6 karakter"),
  })
  .superRefine((v, ctx) => {
    if (v.role === "guru") {
      const email = (v.email ?? "").trim();
      if (!email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Email wajib diisi" });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Format email tidak valid" });
      }
    } else {
      const username = (v.username ?? "").trim();
      if (username.length < 3) {
        ctx.addIssue({ code: "custom", path: ["username"], message: "Username minimal 3 karakter" });
      } else if (!/^[a-z0-9._-]+$/.test(username)) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: "Hanya huruf kecil, angka, titik, garis bawah, atau strip",
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

const ROLE_TABS = [
  { value: "siswa" as const, label: "Siswa", icon: GraduationCap },
  { value: "guru" as const, label: "Guru", icon: Users },
];

export function UserCreateForm() {
  const router = useRouter();
  const [role, setRole] = useState<"guru" | "siswa">("siswa");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: { role: "siswa", name: "", email: "", username: "", password: "" },
  });

  function selectRole(r: "guru" | "siswa") {
    setRole(r);
    form.setValue("role", r);
    form.clearErrors();
  }

  async function onSubmit(values: FormValues) {
    const result =
      values.role === "guru"
        ? await createUser("guru", {
            name: values.name,
            email: (values.email ?? "").trim(),
            password: values.password,
          })
        : await createUser("siswa", {
            name: values.name,
            username: (values.username ?? "").trim().toLowerCase(),
            password: values.password,
          });

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(values.role === "guru" ? "Akun guru dibuat" : "Akun siswa dibuat");
    router.push("/pengguna");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="clay mt-6 max-w-xl space-y-5 bg-white p-6 md:p-8"
      >
        {/* Pilih peran */}
        <div>
          <p className="mb-2 text-sm font-bold text-clay-ink">Peran</p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_TABS.map(({ value, label, icon: Icon }) => {
              const active = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectRole(value)}
                  className={cn(
                    "clay-sm flex items-center justify-center gap-2 px-3 py-3 text-sm font-black transition hover:[transform:translateY(-2px)]",
                    active ? "bg-clay-rose text-white" : "bg-clay-cream text-clay-ink",
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">Nama Lengkap</FormLabel>
              <FormControl>
                <ClayInput autoComplete="name" placeholder="Nama lengkap" {...field} />
              </FormControl>
              <FormMessage className="text-clay-coral" />
            </FormItem>
          )}
        />

        {role === "guru" ? (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">Email</FormLabel>
                <FormControl>
                  <ClayInput
                    type="email"
                    autoComplete="off"
                    placeholder="nama@sekolah.id"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">Username</FormLabel>
                <FormControl>
                  <ClayInput autoComplete="off" placeholder="contoh: budi.santoso" {...field} />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold text-clay-ink">Password</FormLabel>
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

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {form.formState.isSubmitting ? "Membuat…" : "Buat Akun"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/pengguna")}
            className="clay-sm bg-white px-6 py-3 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)]"
          >
            Batal
          </button>
        </div>
      </form>
    </Form>
  );
}
