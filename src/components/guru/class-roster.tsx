"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { removeStudent } from "@/lib/actions/classes";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type RosterStudent = {
  studentId: string;
  name: string;
  email: string;
  enrolledAt: string;
};

export function ClassRoster({
  classId,
  students,
}: {
  classId: number;
  students: RosterStudent[];
}) {
  if (students.length === 0) {
    return (
      <div className="clay mt-4 flex flex-col items-center gap-3 bg-white p-10 text-center">
        <span className="clay-sm grid size-14 place-items-center bg-clay-lavender text-clay-ink">
          <Users className="size-7" />
        </span>
        <p className="font-serif text-lg font-bold text-clay-ink">Belum ada siswa</p>
        <p className="max-w-sm font-semibold text-clay-ink/60">
          Bagikan kode kelas di atas agar siswa dapat bergabung.
        </p>
      </div>
    );
  }

  return (
    <div className="clay mt-4 overflow-hidden bg-white">
      <ul className="divide-y divide-clay-cream">
        {students.map((s) => (
          <RosterRow key={s.studentId} classId={classId} student={s} />
        ))}
      </ul>
    </div>
  );
}

function RosterRow({
  classId,
  student,
}: {
  classId: number;
  student: RosterStudent;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeStudent(classId, student.studentId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Siswa dikeluarkan dari kelas");
      router.refresh();
    });
  }

  const enrolled = new Date(student.enrolledAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <span className="clay-sm grid size-11 shrink-0 place-items-center bg-clay-lavender text-lg font-black text-clay-ink">
        {student.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-clay-ink">{student.name}</p>
        <p className="truncate font-mono text-xs font-bold text-clay-ink/55">
          {student.email} · Bergabung {enrolled}
        </p>
      </div>

      <Dialog>
        <DialogTrigger
          aria-label="Keluarkan siswa"
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-coral transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <UserMinus className="size-4" /> Keluarkan
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluarkan siswa?</DialogTitle>
            <DialogDescription>
              {student.name} akan dikeluarkan dari kelas ini. Siswa dapat bergabung
              kembali dengan kode kelas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="clay-sm bg-white px-4 py-2 text-sm font-black text-clay-ink">
              Batal
            </DialogClose>
            <button
              type="button"
              disabled={pending}
              onClick={handleRemove}
              className="clay-sm bg-clay-coral px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {pending ? "Memproses…" : "Keluarkan"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
