import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";
import { roleHome } from "@/lib/roles";

// Handle Supabase Auth callback (konfirmasi email / magic link / OAuth).
// Menukar `code` dengan session, lalu redirect ke tujuan sesuai role.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const destination = next ?? roleHome(await getUserRole());
      return NextResponse.redirect(new URL(destination, origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback", origin),
  );
}
