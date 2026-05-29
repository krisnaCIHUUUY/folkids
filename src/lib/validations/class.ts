import { z } from "zod";

// Metadata kelas (tabel classes)
export const classSchema = z.object({
  name: z.string().min(3, "Nama kelas minimal 3 karakter").max(100, "Nama kelas terlalu panjang"),
  grade_level: z.string().min(1, "Tingkat kelas wajib diisi").max(50),
});
export type ClassFormValues = z.infer<typeof classSchema>;

// Kode kelas untuk siswa bergabung
export const joinClassSchema = z.object({
  code: z.string().min(4, "Kode kelas tidak valid").max(12),
});
export type JoinClassFormValues = z.infer<typeof joinClassSchema>;
