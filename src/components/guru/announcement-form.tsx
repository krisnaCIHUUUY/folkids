"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

import { sendAnnouncement } from "@/lib/actions/assignments";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FormShape = { title: string; body: string };

// Form pengumuman ringkas di detail kelas. Mengirim notifikasi 'pengumuman' ke
// seluruh anggota kelas.
export function AnnouncementForm({ classId }: { classId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormShape>({ defaultValues: { title: "", body: "" } });

  async function onSubmit(values: FormShape) {
    const result = await sendAnnouncement({
      classId,
      title: values.title,
      body: values.body || undefined,
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(`Pengumuman terkirim ke ${result.recipients} siswa`);
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="clay-sm mt-4 inline-flex items-center gap-2 bg-clay-lavender px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Megaphone className="size-4" /> Kirim Pengumuman
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="clay mt-4 space-y-4 bg-white p-5">
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">Judul Pengumuman</label>
        <Input
          placeholder="Contoh: Jangan lupa membaca hari ini!"
          {...register("title", { required: true })}
        />
        {errors.title && (
          <p className="text-xs font-semibold text-clay-coral">Judul wajib diisi.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-clay-ink">
          Isi <span className="font-normal text-clay-ink/50">(opsional)</span>
        </label>
        <Textarea placeholder="Tulis pesan untuk siswa…" {...register("body")} />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="clay-sm bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
        >
          {isSubmitting ? "Mengirim…" : "Kirim"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="clay-sm bg-white px-5 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
