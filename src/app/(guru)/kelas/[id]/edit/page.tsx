import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassForm } from "@/components/guru/class-form";

export default async function EditKelasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classId = Number(id);
  if (!Number.isFinite(classId)) notFound();

  const supabase = await createClient();
  const { data: kelas } = await supabase
    .from("classes")
    .select("name, grade_level")
    .eq("id", classId)
    .maybeSingle();

  if (!kelas) notFound();

  return (
    <div className="pt-6">
      <Link
        href={`/kelas/${classId}`}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-clay-ink/60 hover:text-clay-ink"
      >
        <ArrowLeft className="size-4" /> Kembali ke kelas
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
        Edit Kelas
      </h1>
      <ClassForm
        classId={classId}
        defaultValues={{ name: kelas.name, grade_level: kelas.grade_level }}
      />
    </div>
  );
}
