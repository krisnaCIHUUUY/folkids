import { createClient } from "@supabase/supabase-js";

// Client service-role: BYPASS RLS. Hanya boleh diimpor dari kode server
// (Server Actions / route handlers), tidak pernah dari Client Component.
// Dipakai mis. untuk membuat akun siswa pra-konfirmasi via admin.createUser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
