import { ClipboardList } from "lucide-react";
import type { DashboardTask } from "@/lib/mock/siswa-dashboard";
import { TaskCard } from "@/components/siswa/task-card";

export function AssignedTaskSection({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <span className="clay-sm grid size-10 place-items-center bg-clay-blue text-white">
          <ClipboardList className="size-5" />
        </span>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-clay-ink">
          Tugas dari Guru
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
