"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuruNotification } from "@/lib/mock/guru-dashboard";

export function NotificationBell({
  notifications,
}: {
  notifications: GuruNotification[];
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => n.unread).length;

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
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="clay-sm relative grid size-11 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-clay-coral px-1 font-mono text-[10px] font-black text-white ring-2 ring-clay-cream">
            {unreadCount}
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
              disabled={unreadCount === 0}
              className="font-mono text-[11px] font-bold uppercase tracking-wider text-clay-rose transition hover:underline disabled:text-clay-ink/30 disabled:no-underline"
            >
              Tandai Semua Dibaca
            </button>
          </div>

          <ul className="mt-3 space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "clay-sm flex gap-3 p-3",
                  n.unread ? "bg-clay-cream" : "bg-white",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    n.unread ? "bg-clay-coral" : "bg-transparent",
                  )}
                />
                <div>
                  <p className="text-sm font-semibold leading-snug text-clay-ink">
                    {n.text}
                  </p>
                  <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/45">
                    {n.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
