import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthShell
        title="Tautan Tidak Valid"
        subtitle="Tautan reset password tidak valid atau sudah kedaluwarsa."
        footer={
          <Link href="/lupa-password" className="font-black text-clay-rose hover:underline">
            Minta tautan baru
          </Link>
        }
      >
        <p className="text-center font-semibold text-clay-ink/70">
          Silakan minta tautan reset password yang baru lalu buka tautannya
          langsung dari email.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Setel Password Baru"
      subtitle="Buat password baru untuk akunmu."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
