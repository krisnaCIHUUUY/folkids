"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, FileStack, Pencil, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { deleteStory } from "@/lib/actions/stories";
import { PublishToggle } from "@/components/guru/publish-toggle";
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

const DIFFICULTY_LABEL: Record<string, string> = {
  mudah: "Mudah",
  sedang: "Sedang",
  sulit: "Sulit",
};

export type StoryRowData = {
  id: number;
  title: string;
  cover_image_url: string | null;
  region_origin: string | null;
  difficulty: string;
  is_published: boolean;
  updated_at: string;
};

export function StoryRow({ data }: { data: StoryRowData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStory(data.id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Cerita dihapus");
      router.refresh();
    });
  }

  const updated = new Date(data.updated_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="clay-sm flex flex-col gap-4 bg-white p-4 transition hover:[transform:translateY(-4px)] sm:flex-row sm:items-center">
      <span className="clay-inset relative grid h-28 w-full shrink-0 place-items-center overflow-hidden bg-clay-cream sm:size-20">
        {data.cover_image_url ? (
          <Image
            src={data.cover_image_url}
            alt={data.title}
            fill
            className="object-cover"
          />
        ) : (
          <BookOpen className="size-7 text-clay-ink/30" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg font-bold leading-snug text-clay-ink">
          {data.title}
        </h3>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs font-bold text-clay-ink/55">
          {data.region_origin && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {data.region_origin}
            </span>
          )}
          <span>{DIFFICULTY_LABEL[data.difficulty] ?? data.difficulty}</span>
          <span>Diperbarui {updated}</span>
        </div>
      </div>

      <PublishToggle storyId={data.id} initial={data.is_published} />

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/cms/${data.id}/halaman`}
          className="clay-sm inline-flex items-center gap-1.5 bg-clay-rose px-3 py-2 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <FileStack className="size-4" /> Halaman
        </Link>
        <Link
          href={`/cms/${data.id}/edit`}
          className="clay-sm inline-flex items-center gap-1.5 bg-white px-3 py-2 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Pencil className="size-4" /> Edit
        </Link>

        <Dialog>
          <DialogTrigger
            aria-label="Hapus cerita"
            className="clay-sm grid size-9 place-items-center bg-white text-clay-coral transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Trash2 className="size-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus cerita?</DialogTitle>
              <DialogDescription>
                Cerita &ldquo;{data.title}&rdquo; beserta semua halamannya akan
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
      </div>
    </article>
  );
}
