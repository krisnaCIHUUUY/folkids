"use client";

// Tombol putar pada kartu cerita landing page: membuka modal cuplikan video.
// Video otomatis berhenti saat modal ditutup karena Base UI meng-unmount
// konten dialog ketika tertutup (keepMounted default false).
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function StoryPreviewButton({
  title,
  video,
  accent,
}: {
  title: string;
  video: string;
  accent: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Putar cuplikan ${title}`}
        className={`clay-sm grid size-9 shrink-0 cursor-pointer place-items-center text-white transition hover:[transform:translateY(-2px)] active:[transform:translateY(1px)] ${accent}`}
      >
        <Play className="size-4 fill-white" />
      </DialogTrigger>
      <DialogContent className="bg-white p-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg font-black text-clay-ink">
            Cuplikan: {title}
          </DialogTitle>
        </DialogHeader>
        <video
          controls
          autoPlay
          src={video}
          className="clay-inset aspect-video w-full bg-black"
        >
          Browser-mu tidak mendukung pemutar video.
        </video>
      </DialogContent>
    </Dialog>
  );
}
