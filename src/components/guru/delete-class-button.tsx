"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClass } from "@/lib/actions/classes";
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

export function DeleteClassButton({
  classId,
  className,
}: {
  classId: number;
  className: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteClass(classId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Kelas dihapus");
      router.push("/kelas");
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-coral transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]">
        <Trash2 className="size-4" /> Hapus
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus kelas?</DialogTitle>
          <DialogDescription>
            Kelas &ldquo;{className}&rdquo; beserta seluruh keanggotaan siswanya akan
            dihapus permanen. Tindakan ini tidak bisa dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="clay-sm bg-white px-4 py-2 text-sm font-black text-clay-ink">
            Batal
          </DialogClose>
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="clay-sm bg-clay-coral px-4 py-2 text-sm font-black text-white disabled:opacity-60"
          >
            {pending ? "Menghapus…" : "Hapus"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
