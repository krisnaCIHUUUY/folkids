import Link from "next/link";
import { Plus, GraduationCap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClassListCard } from "@/components/guru/class-list-card";
import { WayangAccent } from "@/components/wayang-accent";

export default async function KelasPage() {
  const supabase = await createClient();

  // RLS sudah membatasi: guru hanya melihat kelas miliknya, admin melihat semua.
  // class_students(count) → jumlah siswa per kelas dalam satu query.
  const { data: rows } = await supabase
    .from("classes")
    .select("id, name, grade_level, code, class_students(count)")
    .order("created_at", { ascending: false });

  const list = (rows ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade_level: c.grade_level,
    code: c.code,
    studentCount: c.class_students?.[0]?.count ?? 0,
  }));

  return (
    <div className="pt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center overflow-hidden">
            <WayangAccent className="absolute inset-0 h-full w-full text-clay-blue/30" />
            <span className="clay-sm relative grid size-10 place-items-center bg-clay-blue text-white">
              <GraduationCap className="size-5" />
            </span>
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-clay-ink md:text-3xl">
            Manajemen Kelas
          </h1>
        </div>

        <Link
          href="/kelas/buat"
          className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Plus className="size-4" /> Buat Kelas
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="clay mt-8 flex flex-col items-center gap-3 bg-white p-10 text-center">
          <span className="clay-sm grid size-14 place-items-center bg-clay-blue text-white">
            <Users className="size-7" />
          </span>
          <p className="font-serif text-lg font-bold text-clay-ink">
            Belum ada kelas
          </p>
          <p className="max-w-sm font-semibold text-clay-ink/60">
            Buat kelas pertamamu, lalu bagikan kodenya agar siswa bisa bergabung.
          </p>
          <Link
            href="/kelas/buat"
            className="clay-sm mt-2 inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Plus className="size-4" /> Buat Kelas
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ClassListCard key={c.id} data={c} />
          ))}
        </div>
      )}
    </div>
  );
}
