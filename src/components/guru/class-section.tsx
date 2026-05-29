import Link from "next/link";
import { GraduationCap, Plus } from "lucide-react";
import { ClassListCard, type ClassListData } from "@/components/guru/class-list-card";
import { WayangAccent } from "@/components/wayang-accent";

export function ClassSection({ classes }: { classes: ClassListData[] }) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center overflow-hidden">
            <WayangAccent className="absolute inset-0 h-full w-full text-clay-blue/20" />
            <span className="clay-sm relative grid size-10 place-items-center bg-clay-blue text-white">
              <GraduationCap className="size-5" />
            </span>
          </span>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
            Kelas Saya
          </h2>
        </div>

        <Link
          href="/kelas/buat"
          className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-4 py-2 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Plus className="size-4" /> Buat Kelas
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="clay mt-5 flex flex-col items-center gap-2 bg-white p-8 text-center">
          <p className="font-serif text-lg font-bold text-clay-ink">
            Belum ada kelas
          </p>
          <p className="max-w-sm font-semibold text-clay-ink/60">
            Buat kelas pertamamu, lalu bagikan kodenya agar siswa bisa bergabung.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((data) => (
            <ClassListCard key={data.id} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}
