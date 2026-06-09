import Link from "next/link";
import { X } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="clay relative w-full max-w-md bg-white p-7 md:p-8">
      {/* Tombol tutup → kembali ke landing page */}
      <Link
        href="/"
        aria-label="Kembali ke beranda"
        className="clay-sm absolute right-4 top-4 grid size-9 place-items-center bg-clay-cream text-clay-ink/70 transition hover:[transform:translateY(-2px)] hover:text-clay-ink active:[transform:translateY(1px)]"
      >
        <X className="size-5" />
      </Link>
      <div className="flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-3">
          <span className="clay-sm grid size-12 place-items-center bg-clay-sun text-2xl">
            🎭
          </span>
          <span className="text-2xl font-black tracking-tight text-clay-ink">
            Wayang<span className="text-clay-rose">Folkids</span>
          </span>
        </Link>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-clay-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm font-semibold text-clay-ink/70">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-7">{children}</div>

      {footer && (
        <div className="mt-6 text-center text-sm font-semibold text-clay-ink/70">
          {footer}
        </div>
      )}
    </div>
  );
}
