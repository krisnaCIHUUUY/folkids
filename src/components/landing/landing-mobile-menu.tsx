"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogIn } from "lucide-react";

const LINKS = [
  { href: "#cerita", label: "Perpustakaan" },
  { href: "#progres", label: "Progres" },
  { href: "#cerita-mereka", label: "Cerita Mereka" },
  { href: "#daftar", label: "Untuk Guru" },
] as const;

// Menu navigasi landing page untuk layar kecil. Di md+ navigasi inline dipakai
// (lihat SiteNav), jadi komponen ini disembunyikan dengan `md:hidden`.
export function LandingMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menu navigasi"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="clay-sm grid size-11 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-2px)] active:[transform:translateY(2px)]"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          {/* Lapisan penutup: klik di luar menutup menu */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-clay-ink/10"
          />
          <nav className="clay fixed inset-x-4 top-[6.25rem] z-50 flex flex-col gap-1 bg-white p-3">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-bold text-clay-ink/80 transition hover:bg-clay-cream hover:text-clay-ink"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="clay-sm mt-1 inline-flex items-center justify-center gap-2 bg-clay-ink px-4 py-3 text-base font-black text-white"
            >
              <LogIn className="size-4" /> Masuk
            </Link>
          </nav>
        </>
      )}
    </div>
  );
}
