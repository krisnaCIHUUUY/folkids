import { z } from "zod";

// Username siswa: huruf kecil/angka/._- , 3–30 karakter (sama dgn validations/auth.ts).
const usernameField = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .max(30, "Username maksimal 30 karakter")
  .regex(
    /^[a-z0-9._-]+$/,
    "Username hanya boleh huruf kecil, angka, titik, garis bawah, atau strip",
  );

const nameField = z.string().min(3, "Nama minimal 3 karakter");
const passwordField = z.string().min(6, "Password minimal 6 karakter");

// Buat akun guru (admin) — email + password.
export const createGuruSchema = z.object({
  name: nameField,
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: passwordField,
});
export type CreateGuruValues = z.infer<typeof createGuruSchema>;

// Buat akun siswa (admin) — username + password.
export const createSiswaSchema = z.object({
  name: nameField,
  username: usernameField,
  password: passwordField,
});
export type CreateSiswaValues = z.infer<typeof createSiswaSchema>;

// Edit profil — hanya nama (email/username/peran immutable).
export const editUserSchema = z.object({
  name: nameField,
});
export type EditUserValues = z.infer<typeof editUserSchema>;

// Reset password — password baru + konfirmasi.
export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
