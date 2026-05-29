import Link from "next/link";
import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import type { CurrentUser } from "@/lib/auth";

export function SiswaNavbar({ user }: { user: CurrentUser }) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-clay-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
        <Link href="/beranda" className="flex shrink-0 items-center gap-3">
          <span className="clay-sm grid size-11 place-items-center bg-clay-sun text-xl">
            🎭
          </span>
          <span className="hidden text-xl font-black tracking-tight sm:inline">
            Wayang<span className="text-clay-rose">Folkids</span>
          </span>
        </Link>

        <div className="relative mx-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-clay-ink/40" />
          <input
            type="search"
            placeholder="Cari cerita atau game…"
            className="clay-inset w-full bg-white py-2.5 pl-12 pr-4 font-mono text-sm font-medium text-clay-ink outline-none placeholder:text-clay-ink/40 focus:ring-2 focus:ring-clay-rose/50"
          />
        </div>

        <button
          type="button"
          aria-label="Notifikasi"
          className="clay-sm relative grid size-11 shrink-0 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-clay-coral ring-2 ring-white" />
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-black leading-tight">{user.name}</p>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-clay-ink/55">
              Siswa
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
