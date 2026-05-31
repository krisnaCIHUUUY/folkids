import { ClipboardList } from "lucide-react";
import { TaskCard, type StudentTask } from "@/components/siswa/task-card";

export function AssignedTaskSection({ tasks }: { tasks: StudentTask[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-blue text-white">
          <ClipboardList className="size-5" />
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Tugas untukmu
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="clay mt-5 bg-white p-8 text-center font-semibold text-clay-ink/60">
          Tidak ada tugas saat ini. Jelajahi perpustakaan untuk membaca cerita baru!
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
