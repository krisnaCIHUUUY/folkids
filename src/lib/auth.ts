import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type UserRole } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl: string | null;
};

// Data Access Layer: sumber kebenaran untuk identitas user di server.
// `cache` memastikan hanya 1 query per request meski dipanggil berkali-kali.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("name, role, is_active, avatar_url, email")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    isActive: profile.is_active,
    avatarUrl: profile.avatar_url,
  };
});

export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

// Wajib login + (opsional) role tertentu. Redirect bila tidak memenuhi.
export async function requireRole(allowed: UserRole[]): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user || !user.isActive) {
    redirect("/login");
  }
  if (!allowed.includes(user.role)) {
    redirect(roleHome(user.role));
  }

  return user;
}
