"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  ImageIcon,
  Music,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { deletePage, movePage } from "@/lib/actions/stories";
import { stripHtml } from "@/lib/rich-text";
import { PageForm } from "@/components/guru/page-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PageData = {
  id: number;
  page_number: number;
  content: string;
  illustration_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  character_values: string | null;
};

export function StoryPagesManager({
  storyId,
  pages,
  modulePdfUrl,
}: {
  storyId: number;
  pages: PageData[];
  modulePdfUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PageData | null>(null);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(page: PageData) {
    setEditing(page);
    setDialogOpen(true);
  }

  function handleMove(pageId: number, direction: "up" | "down") {
    startTransition(async () => {
      const result = await movePage(pageId, storyId, direction);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(pageId: number) {
    startTransition(async () => {
      const result = await deletePage(pageId, storyId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Halaman dihapus");
      router.refresh();
    });
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={openAdd}
        className="clay-sm inline-flex items-center gap-2 bg-clay-rose px-5 py-2.5 text-sm font-black text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Plus className="size-4" /> Tambah Halaman
      </button>

      {modulePdfUrl && (
        <div className="clay-sm mt-4 flex items-center gap-3 bg-clay-sun/10 p-4">
          <span className="clay-sm grid size-10 shrink-0 place-items-center bg-clay-coral text-white">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-clay-ink">Modul PDF sudah diunggah</p>
            <a
              href={modulePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs font-bold text-clay-blue hover:underline"
            >
              Lihat PDF di tab baru
            </a>
          </div>
        </div>
      )}

      {pages.length === 0 ? (
        <div className="clay-inset mt-5 bg-clay-cream p-8 text-center">
          <p className="font-semibold text-clay-ink/60">
            Belum ada halaman. Tambahkan halaman pertama cerita ini.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {pages.map((page, idx) => (
            <article
              key={page.id}
              className="clay-sm flex items-start gap-4 bg-white p-4"
            >
              <span className="clay-sm grid size-10 shrink-0 place-items-center bg-clay-sun font-mono text-base font-black text-clay-ink">
                {page.page_number}
              </span>

              <span className="clay-inset relative size-16 shrink-0 overflow-hidden bg-clay-cream">
                {page.illustration_url ? (
                  <Image
                    src={page.illustration_url}
                    alt={`Halaman ${page.page_number}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full place-items-center">
                    <ImageIcon className="size-5 text-clay-ink/30" />
                  </span>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-clay-ink/80">
                  {stripHtml(page.content)}
                </p>
                {page.audio_url && (
                  <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs font-bold text-clay-mint">
                    <Music className="size-3.5" /> Ada audio
                  </span>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Naikkan urutan"
                  disabled={pending || idx === 0}
                  onClick={() => handleMove(page.id, "up")}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Turunkan urutan"
                  disabled={pending || idx === pages.length - 1}
                  onClick={() => handleMove(page.id, "down")}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)] disabled:opacity-30"
                >
                  <ChevronDown className="size-4" />
                </button>
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label="Edit halaman"
                  onClick={() => openEdit(page)}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-ink transition active:[transform:translateY(2px)]"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Hapus halaman"
                  disabled={pending}
                  onClick={() => handleDelete(page.id)}
                  className="clay-sm grid size-8 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)] disabled:opacity-60"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit Halaman ${editing.page_number}` : "Tambah Halaman"}
            </DialogTitle>
          </DialogHeader>
          <PageForm
            storyId={storyId}
            pageId={editing?.id}
            defaultValues={
              editing
                ? {
                    content: editing.content,
                    illustration_url: editing.illustration_url ?? "",
                    audio_url: editing.audio_url ?? "",
                    video_url: editing.video_url ?? "",
                    character_values: editing.character_values ?? "",
                  }
                : undefined
            }
            onDone={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
