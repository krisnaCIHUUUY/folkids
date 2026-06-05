"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { setUserActive } from "@/lib/actions/admin-users";
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

export function SetActiveButton({
  userId,
  userName,
  isActive,
}: {
  userId: string;
  userName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Saat aktif → tombol untuk menonaktifkan; saat nonaktif → untuk mengaktifkan.
  const next = !isActive;

  function handleToggle() {
    startTransition(async () => {
      const result = await setUserActive(userId, next);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Akun diaktifkan" : "Akun dinonaktifkan");
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger
        className={`clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] ${
          isActive ? "text-clay-coral" : "text-clay-ink"
        }`}
      >
        {isActive ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isActive ? "Nonaktifkan akun?" : "Aktifkan akun?"}</DialogTitle>
          <DialogDescription>
            {isActive ? (
              <>
                Akun &ldquo;{userName}&rdquo; tidak akan bisa masuk sampai
                diaktifkan kembali.
              </>
            ) : (
              <>Akun &ldquo;{userName}&rdquo; akan bisa masuk kembali.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="clay-sm bg-white px-4 py-2 text-sm font-black text-clay-ink">
            Batal
          </DialogClose>
          <button
            type="button"
            disabled={pending}
            onClick={handleToggle}
            className={`clay-sm px-4 py-2 text-sm font-black text-white disabled:opacity-60 ${
              isActive ? "bg-clay-coral" : "bg-clay-mint !text-clay-ink"
            }`}
          >
            {pending ? "Memproses…" : isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
