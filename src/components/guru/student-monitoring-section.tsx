import { Activity } from "lucide-react";
import type { StudentParticipation } from "@/lib/mock/guru-dashboard";
import { StudentCard } from "@/components/guru/student-card";
import { WayangAccent } from "@/components/wayang-accent";

export function StudentMonitoringSection({
  students,
}: {
  students: StudentParticipation[];
}) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="relative grid size-10 place-items-center overflow-hidden">
          <WayangAccent className="absolute inset-0 h-full w-full text-clay-mint/25" />
          <span className="clay-sm relative grid size-10 place-items-center bg-clay-mint text-clay-ink">
            <Activity className="size-5" />
          </span>
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Pantau Siswa
        </h2>
      </div>

      {students.length === 0 ? (
        <div className="clay mt-5 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Belum ada siswa di kelasmu. Bagikan kode kelas agar siswa bergabung.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((data) => (
            <StudentCard key={data.id} data={data} />
          ))}
        </div>
      )}
    </section>
  );
}
