"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateUserProfile, resetUserPassword } from "@/lib/actions/admin-users";
import { editUserSchema, type EditUserValues } from "@/lib/validations/admin-user";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/admin-user";
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

export function AccountSettings({
  user,
}: {
  user: { id: string; name: string; email: string };
}) {
  const router = useRouter();

  const profileForm = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    mode: "onTouched",
    defaultValues: { name: user.name },
  });

  const passwordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSaveProfile(values: EditUserValues) {
    const result = await updateUserProfile(user.id, values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Profil diperbarui");
    router.refresh();
  }

  async function onChangePassword(values: ResetPasswordValues) {
    const result = await resetUserPassword(user.id, values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Password berhasil diubah");
    passwordForm.reset();
  }

  return (
    <div className="mt-6 grid max-w-xl gap-6">
      {/* Profil */}
      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="clay space-y-5 bg-white p-6 md:p-8"
        >
          <h2 className="font-serif text-lg font-bold text-clay-ink">Profil</h2>

          <FormField
            control={profileForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-clay-ink">Nama</FormLabel>
                <FormControl>
                  <ClayInput autoComplete="name" placeholder="Nama lengkap" {...field} />
                </FormControl>
                <FormMessage className="text-clay-coral" />
              </FormItem>
            )}
          />

          <div>
            <p className="mb-2 text-sm font-bold text-clay-ink">Email</p>
            <div className="clay-inset w-full bg-clay-cream/60 px-5 py-3.5 text-base font-semibold text-clay-ink/60">
              {user.email}
            </div>
          </div>

          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {profileForm.formState.isSubmitting ? "Menyimpan…" : "Simpan Profil"}
          </button>
        </form>
      </Form>

      {/* Ganti password */}
      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="clay space-y-5 bg-white p-6 md:p-8"
        >
          <h2 className="font-serif text-lg font-bold text-clay-ink">Ganti Password</h2>

          <FormField
            control={passwordForm.control}
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
            control={passwordForm.control}
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

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="clay-sm bg-clay-rose px-6 py-3 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
          >
            {passwordForm.formState.isSubmitting ? "Menyimpan…" : "Ubah Password"}
          </button>
        </form>
      </Form>
    </div>
  );
}
