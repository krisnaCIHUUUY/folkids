"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { resetUserPassword } from "@/lib/actions/admin-users";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/admin-user";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordValues) {
    const result = await resetUserPassword(userId, values);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Password berhasil direset");
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]">
        <KeyRound className="size-4" /> Reset Password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Tetapkan password baru untuk &ldquo;{userName}&rdquo;. Sampaikan
            password ini ke pengguna.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <DialogClose className="clay-sm bg-white px-4 py-2 text-sm font-black text-clay-ink">
                Batal
              </DialogClose>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="clay-sm bg-clay-rose px-4 py-2 text-sm font-black text-white disabled:opacity-60"
              >
                {form.formState.isSubmitting ? "Menyimpan…" : "Simpan Password"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
