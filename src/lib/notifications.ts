import { createClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/components/notifications/notification-bell";

const NOTIF_LIMIT = 15;

// Simple in-memory cache for notifications (per-request caching via module scope)
// This prevents multiple DB calls within the same request lifecycle.
let cachedNotifications: NotificationItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds

// Ambil notifikasi terbaru milik user yang sedang login (RLS membatasi ke
// user_id = auth.uid()). Dipakai oleh navbar siswa & guru.
export async function getMyNotifications(): Promise<NotificationItem[]> {
  const now = Date.now();
  if (cachedNotifications !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedNotifications;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(NOTIF_LIMIT);

  const result = (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    createdAt: n.created_at,
    read: n.read_at !== null,
  }));

  cachedNotifications = result;
  cacheTimestamp = now;

  return result;
}
