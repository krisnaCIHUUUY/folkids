import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { JoinClassForm } from "@/components/siswa/join-class-form";

export default async function GabungKelasPage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  // Kelas yang sudah diikuti siswa (RLS membatasi ke keanggotaan sendiri).
  const { data: rows } = await supabase
    .from("class_students")
    .select("enrolled_at, classes(name, grade_level)")
    .eq("student_id", user!.id)
    .order("enrolled_at", { ascending: false });

  const kelasSaya = (rows ?? []).map((r) => {
    const c = (Array.isArray(r.classes) ? r.classes[0] : r.classes) as
      | { name: string; grade_level: string }
      | null;
    return { name: c?.name ?? "Kelas", grade_level: c?.grade_level ?? "" };
  });

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-blue text-white">
          <Users className="size-5" />
        </span>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
          Gabung Kelas
        </h1>
      </div>
      <p className="mt-2 font-semibold text-clay-ink/60">
        Masukkan kode kelas dari gurumu untuk bergabung.
      </p>

      <JoinClassForm />

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-clay-ink">Kelas Saya</h2>
        {kelasSaya.length === 0 ? (
          <p className="clay mt-4 bg-white p-6 font-semibold text-clay-ink/60">
            Kamu belum bergabung ke kelas mana pun.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {kelasSaya.map((k, i) => (
              <li key={i} className="clay-sm bg-white p-4">
                <p className="font-bold text-clay-ink">{k.name}</p>
                <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
                  {k.grade_level}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
