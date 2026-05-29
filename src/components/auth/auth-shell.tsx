import Link from "next/link";

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
    <div className="clay w-full max-w-md bg-white p-7 md:p-8">
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
