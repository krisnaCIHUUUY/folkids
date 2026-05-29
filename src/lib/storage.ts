// Helper validasi & penamaan path untuk upload media cerita ke bucket "story-media".
// Upload aktual dilakukan komponen via browser client (lihat media-uploader.tsx).

export const STORY_MEDIA_BUCKET = "story-media";

type MediaKind = "image" | "audio";

const LIMITS: Record<MediaKind, { maxBytes: number; label: string }> = {
  image: { maxBytes: 10 * 1024 * 1024, label: "10MB" },
  audio: { maxBytes: 50 * 1024 * 1024, label: "50MB" },
};

const PREFIX: Record<MediaKind, string> = {
  image: "image/",
  audio: "audio/",
};

// Mengembalikan pesan error (string) bila tidak valid, atau null bila lolos.
export function validateMedia(file: File, kind: MediaKind): string | null {
  if (!file.type.startsWith(PREFIX[kind])) {
    return kind === "image"
      ? "File harus berupa gambar"
      : "File harus berupa audio";
  }
  if (file.size > LIMITS[kind].maxBytes) {
    return `Ukuran file melebihi ${LIMITS[kind].label}`;
  }
  return null;
}

export function storyMediaPath(userId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}
