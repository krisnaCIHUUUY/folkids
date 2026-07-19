"use client";

// Tombol putar pada kartu cerita landing page: membuka modal cuplikan video.
// Lazy load dua lapis untuk menghemat bandwidth:
// 1. Elemen <video> baru di-mount saat modal dibuka (Base UI meng-unmount
//    konten dialog ketika tertutup, keepMounted default false).
// 2. preload="none" + poster: saat modal terbuka hanya gambar poster (~100KB)
//    yang diunduh; byte video baru mengalir setelah pengguna menekan Play.
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/ui/video-player";

export function StoryPreviewButton({
  title,
  video,
  poster,
  accent,
}: {
  title: string;
  video: string;
  poster: string;
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
        <VideoPlayer preload="none" poster={poster} src={video} />
      </DialogContent>
    </Dialog>
  );
}
