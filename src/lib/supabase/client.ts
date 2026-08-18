import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Fragment `#access_token` (implicit flow) diproses manual oleh
        // AuthUrlHandler agar kita bisa tahu `type` (recovery/email) & `next`.
        detectSessionInUrl: false,
      },
    },
  );
}
