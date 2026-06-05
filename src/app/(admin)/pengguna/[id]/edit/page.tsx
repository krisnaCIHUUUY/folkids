import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserEditForm } from "@/components/admin/user-edit-form";

export default async function EditPenggunaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", id)
    .maybeSingle();

  if (!user) notFound();

  const identity = user.role === "siswa" ? user.email.split("@")[0] : user.email;

  return (
    <div className="pt-2">
      <Link
        href="/pengguna"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 transition hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Edit Pengguna
      </h1>
      <UserEditForm
        user={{ id: user.id, name: user.name, identity, role: user.role }}
      />
    </div>
  );
}
