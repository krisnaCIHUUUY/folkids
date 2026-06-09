"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ClipboardList,
  ListChecks,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "@/lib/actions/notifications";
import type { Database } from "@/types/database";

type NotificationType = Database["public"]["Enums"]["notification_type"];

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
  read: boolean;
};

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  tugas_baru: ClipboardList,
  kuis_dinilai: ListChecks,
  pengumuman: Megaphone,
};

// Format waktu relatif sederhana berbahasa Indonesia.
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = items.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function markAllRead() {
    if (unreadCount === 0) return;
    startTransition(async () => {
      await markNotificationsRead();
      router.refresh();
    });
  }

  function handleItemClick(item: NotificationItem) {
    setOpen(false);
    if (!item.read) {
      startTransition(async () => {
        await markNotificationsRead([item.id]);
        router.refresh();
      });
    }
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="clay-sm relative grid size-11 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-clay-coral px-1 font-mono text-[10px] font-black text-white ring-2 ring-clay-cream">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="clay absolute right-0 top-14 z-50 w-80 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-clay-ink">
              Notifikasi
            </h3>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0 || isPending}
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-clay-rose transition hover:underline disabled:text-clay-ink/30 disabled:no-underline"
            >
              Tandai Semua Dibaca
            </button>
          </div>

          {items.length === 0 ? (
            <p className="mt-4 py-6 text-center text-sm font-semibold text-clay-ink/55">
              Belum ada notifikasi.
            </p>
          ) : (
            <ul className="mt-3 max-h-96 space-y-2 overflow-y-auto">
              {items.map((n) => {
                const Icon = TYPE_ICON[n.type];
                const inner = (
                  <>
                    <span
                      className={cn(
                        "clay-sm grid size-8 shrink-0 place-items-center",
                        n.read
                          ? "bg-clay-cream text-clay-ink/50"
                          : "bg-clay-sky text-clay-ink",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-snug text-clay-ink">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-clay-ink/65">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-clay-ink/45">
                        {relativeTime(n.createdAt)}
                      </p>
                    </div>
                  </>
                );
                const className = cn(
                  "clay-sm flex gap-3 p-3 text-left transition",
                  n.read ? "bg-white" : "bg-clay-cream",
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => handleItemClick(n)}
                        className={cn(className, "hover:[transform:translateY(-1px)]")}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleItemClick(n)}
                        className={cn(className, "w-full")}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
