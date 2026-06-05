"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/actions/admin-users";
import { editUserSchema, type EditUserValues } from "@/lib/validations/admin-user";
import { ClayInput } from "@/components/auth/clay-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const ROLE_LABEL: Record<string, string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

export function UserEditForm({
  user,
}: {
  user: { id: string; name: string; identity: string; role: string };
}) {
  const router = useRouter();
  const form = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    mode: "onTouched",
    defaultValues: { name: user.name },
  });

  async function onSubmit(values: EditUserValues) {
    const result = await updateUserProfile(user.id, values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Perubahan tersimpan");
    router.push("/pengguna");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="clay mt-6 max-w-xl space-y-5 bg-white p-6 md:p-8"
      >
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

        {/* Read-only: email/username & peran tidak bisa diubah */}
        <div>
          <p className="mb-2 text-sm font-bold text-clay-ink">
            {user.role === "siswa" ? "Username" : "Email"}
          </p>
          <div className="clay-inset w-full bg-clay-cream/60 px-5 py-3.5 text-base font-semibold text-clay-ink/60">
            {user.identity}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-clay-ink">Peran</p>
          <div className="clay-inset w-fit bg-clay-cream/60 px-5 py-3.5 text-base font-semibold text-clay-ink/60">
            {ROLE_LABEL[user.role] ?? user.role}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
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
