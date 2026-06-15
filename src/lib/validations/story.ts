import { z } from "zod";

// Metadata cerita (tabel stories)
export const storySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  synopsis: z.string().max(2000, "Sinopsis terlalu panjang").optional().or(z.literal("")),
  region_origin: z.string().max(100).optional().or(z.literal("")),
  character_theme: z.string().max(100).optional().or(z.literal("")),
  difficulty: z.enum(["mudah", "sedang", "sulit"]),
  cover_image_url: z.string().url("URL cover tidak valid").optional().or(z.literal("")),
});
export type StoryFormValues = z.infer<typeof storySchema>;

// Konten satu halaman cerita (tabel story_pages)
export const storyPageSchema = z.object({
  content: z.string().min(1, "Konten halaman wajib diisi"),
  illustration_url: z.string().url("URL ilustrasi tidak valid").optional().or(z.literal("")),
  audio_url: z.string().url("URL audio tidak valid").optional().or(z.literal("")),
  video_url: z.string().url("URL video tidak valid").optional().or(z.literal("")),
  character_values: z.string().max(500).optional().or(z.literal("")),
});
export type StoryPageFormValues = z.infer<typeof storyPageSchema>;
