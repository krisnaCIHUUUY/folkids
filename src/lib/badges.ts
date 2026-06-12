import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type BadgeCategory = Database["public"]["Enums"]["badge_category"];

export type BadgeItem = {
  id: number;
  code: string;
  name: string;
  description: string;
  emoji: string;
  category: BadgeCategory;
  unlocked: boolean;
  earnedAt: string | null;
};

// Label kategori untuk tampilan (halaman /lencana).
export const BADGE_CATEGORY_LABEL: Record<BadgeCategory, string> = {
  membaca: "Membaca",
  kuis: "Kuis",
  game: "Game",
};

// Ambil seluruh katalog lencana + status perolehan milik user yang login.
// RLS membatasi student_badges ke milik sendiri (student_id = auth.uid()).
export async function getMyBadges(): Promise<BadgeItem[]> {
  const supabase = await createClient();
  const [catalogRes, earnedRes] = await Promise.all([
    supabase
      .from("badges")
      .select("id, code, name, description, emoji, category, sort_order")
      .order("sort_order", { ascending: true }),
    supabase.from("student_badges").select("badge_id, earned_at"),
  ]);

  const earned = new Map(
    (earnedRes.data ?? []).map((e) => [e.badge_id, e.earned_at]),
  );

  return (catalogRes.data ?? []).map((b) => ({
    id: b.id,
    code: b.code,
    name: b.name,
    description: b.description,
    emoji: b.emoji,
    category: b.category,
    unlocked: earned.has(b.id),
    earnedAt: earned.get(b.id) ?? null,
  }));
}
