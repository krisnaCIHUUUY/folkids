import Link from "next/link";
import Image from "next/image";
import { Search, Users, BookOpen, Home, Gamepad2, Trophy, Award } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { CurrentUser } from "@/lib/auth";
import type { NotificationItem } from "@/components/notifications/notification-bell";

const NAV_LINKS = [
  { href: "/beranda", label: "Beranda", icon: Home },
  { href: "/perpustakaan", label: "Perpustakaan", icon: BookOpen },
  { href: "/game", label: "Game", icon: Gamepad2 },
  { href: "/papan-peringkat", label: "Peringkat", icon: Trophy },
  { href: "/lencana", label: "Lencana", icon: Award },
  { href: "/gabung-kelas", label: "Gabung Kelas", icon: Users },
] as const;

export async function SiswaNavbar({
  user,
  notifications,
}: {
  user: CurrentUser;
  notifications: NotificationItem[];
}) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-clay-cream/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        {/* Baris atas: identitas, pencarian, dan aksi akun */}
        <div className="flex items-center gap-3 md:gap-4">
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
              aria-label="Cari cerita atau game"
              className="clay-inset w-full bg-white py-2.5 pl-12 pr-4 font-mono text-sm font-medium text-clay-ink outline-none placeholder:text-clay-ink/40 focus-visible:ring-2 focus-visible:ring-clay-rose/50"
            />
          </div>

          <NotificationBell items={notifications} />

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

        {/* Baris navigasi: dapat di-scroll horizontal di layar kecil */}
        <nav aria-label="Navigasi siswa" className="-mx-4 mt-2 flex items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-clay-ink/70 transition hover:bg-white hover:text-clay-ink"
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
