"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Music, Video } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  STORY_MEDIA_BUCKET,
  validateMedia,
  storyMediaPath,
} from "@/lib/storage";

type MediaKind = "image" | "audio" | "video";

// Atribut accept input file per jenis media.
const ACCEPT: Record<MediaKind, string> = {
  image: "image/*",
  audio: "audio/*",
  video: "video/mp4,video/webm",
};

export function MediaUploader({
  value,
  onChange,
  kind,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  kind: MediaKind;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const invalid = validateMedia(file, kind);
    if (invalid) {
      toast.error(invalid);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Sesi berakhir. Silakan masuk lagi.");
        return;
      }

      const path = storyMediaPath(user.id, file);
      const { error } = await supabase.storage
        .from(STORY_MEDIA_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        toast.error("Gagal mengunggah file. Coba lagi.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORY_MEDIA_BUCKET).getPublicUrl(path);
      onChange(publicUrl);
      toast.success("File berhasil diunggah");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-clay-ink">{label}</p>

      {value && !uploading && (
        <div className="clay-inset relative flex items-center gap-3 bg-clay-cream p-3">
          {kind === "image" ? (
            <span className="clay-sm relative size-16 shrink-0 overflow-hidden bg-white">
              <Image src={value} alt={label} fill sizes="(max-width: 640px) 80vw, 400px" className="object-cover" />
            </span>
          ) : kind === "video" ? (
            <video
              controls
              playsInline
              src={value}
              className="h-24 w-full max-w-xs rounded bg-black"
            />
          ) : (
            <audio controls src={value} className="h-10 w-full max-w-xs" />
          )}
          {kind === "image" && (
            <span className="truncate font-mono text-xs text-clay-ink/60">
              {value.split("/").pop()}
            </span>
          )}
          <button
            type="button"
            aria-label="Hapus media"
            onClick={() => onChange("")}
            className="clay-sm ml-auto grid size-8 shrink-0 place-items-center bg-white text-clay-coral transition active:[transform:translateY(2px)]"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="clay-sm inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-black text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)] disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : kind === "image" ? (
          <Upload className="size-4" />
        ) : kind === "video" ? (
          <Video className="size-4" />
        ) : (
          <Music className="size-4" />
        )}
        {uploading ? "Mengunggah…" : value ? "Ganti File" : "Unggah File"}
      </button>
    </div>
  );
}
