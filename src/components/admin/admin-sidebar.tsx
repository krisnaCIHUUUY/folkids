"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShieldCheck, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import type { CurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dasbor", icon: LayoutDashboard },
  { href: "/pengguna", label: "Pengguna", icon: Users },
  { href: "/akun", label: "Akun Saya", icon: ShieldCheck },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = user.name.charAt(0).toUpperCase();

  const navLinks = (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition",
              active
                ? "clay-sm bg-clay-rose text-white"
                : "text-clay-ink/70 hover:bg-white hover:text-clay-ink",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <span className="clay-sm grid size-10 place-items-center bg-clay-sun text-lg">🎭</span>
      <span className="text-lg font-black tracking-tight">
        Wayang<span className="text-clay-rose">Folkids</span>
      </span>
    </Link>
  );

  const userBlock = (
    <div className="flex items-center gap-3">
      <span className="clay-sm grid size-10 shrink-0 place-items-center overflow-hidden bg-clay-lavender text-base font-black text-clay-ink">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={40}
            height={40}
            className="size-full object-cover"
          />
        ) : (
          initial
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-black leading-tight">{user.name}</p>
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-clay-ink/55">
          Admin
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Bar atas (mobile) */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-clay-cream/85 px-4 py-3 backdrop-blur-md md:hidden">
        {brand}
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setOpen((s) => !s)}
          className="clay-sm grid size-10 place-items-center bg-white text-clay-ink"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Panel mobile */}
      {open && (
        <div className="border-b border-clay-ink/5 bg-clay-cream px-4 py-4 md:hidden">
          {navLinks}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-clay-ink/5 pt-4">
            {userBlock}
            <LogoutButton />
          </div>
        </div>
      )}

      {/* Sidebar tetap (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-clay-cream/85 px-4 py-6 backdrop-blur-md md:flex">
        {brand}
        <div className="flex-1">{navLinks}</div>
        <div className="flex flex-col gap-3 border-t border-clay-ink/5 pt-4">
          {userBlock}
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
