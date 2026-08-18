import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/components/notifications/notification-bell";

const NOTIF_LIMIT = 15;

// Ambil notifikasi terbaru milik user yang sedang login (RLS membatasi ke
// user_id = auth.uid()). Dibungkus React cache() agar satu request tak memanggil
// DB berulang, tanpa berbagi data antar user/request (module-scope cache lama
// menyebabkan notifikasi guru tampak bagi siswa dan menunda notif baru).
export const getMyNotifications = cache(
  async (): Promise<NotificationItem[]> => {
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

    return result;
  },
);
