import { GraduationCap } from "lucide-react";
import type { ClassSummary } from "@/lib/mock/guru-dashboard";
import { ClassCard } from "@/components/guru/class-card";
import { WayangAccent } from "@/components/wayang-accent";

export function ClassSection({ classes }: { classes: ClassSummary[] }) {
  return (
    <section className="mt-10">
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

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((data) => (
          <ClassCard key={data.id} data={data} />
        ))}
      </div>
    </section>
  );
}
