import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function LupaPasswordPage() {
  return (
    <AuthShell
      title="Lupa Password"
      subtitle="Masukkan email akunmu. Kami akan mengirim tautan untuk mereset password."
      footer={
        <>
          Ingat passwordmu?{" "}
          <Link href="/login" className="font-black text-clay-rose hover:underline">
            Kembali ke Masuk
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
