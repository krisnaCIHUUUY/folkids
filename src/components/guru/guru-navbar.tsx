import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/guru/notification-bell";
import { notifications } from "@/lib/mock/guru-dashboard";
import type { CurrentUser } from "@/lib/auth";

export function GuruNavbar({ user }: { user: CurrentUser }) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-clay-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 md:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-3">
          <span className="clay-sm grid size-11 place-items-center bg-clay-sun text-xl">
            🎭
          </span>
          <span className="hidden text-xl font-black tracking-tight sm:inline">
            Wayang<span className="text-clay-rose">Folkids</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          <Link
            href="/dashboard"
            className="rounded-xl px-3 py-2 text-sm font-bold text-clay-ink/70 transition hover:bg-white hover:text-clay-ink"
          >
            Dasbor
          </Link>
          <Link
            href="/kelas"
            className="rounded-xl px-3 py-2 text-sm font-bold text-clay-ink/70 transition hover:bg-white hover:text-clay-ink"
          >
            Kelas
          </Link>
          <Link
            href="/cms"
            className="rounded-xl px-3 py-2 text-sm font-bold text-clay-ink/70 transition hover:bg-white hover:text-clay-ink"
          >
            Cerita
          </Link>
          <Link
            href="/asesmen"
            className="rounded-xl px-3 py-2 text-sm font-bold text-clay-ink/70 transition hover:bg-white hover:text-clay-ink"
          >
            Asesmen
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Cari"
            className="clay-sm grid size-11 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
          >
            <Search className="size-5" />
          </button>

          <NotificationBell notifications={notifications} />

          <div className="hidden text-right md:block">
            <p className="text-sm font-black leading-tight">{user.name}</p>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
              Guru
            </p>
          </div>
          <span className="clay-sm grid size-11 shrink-0 place-items-center overflow-hidden bg-clay-lavender text-lg font-black text-clay-ink">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={44}
                height={44}
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
