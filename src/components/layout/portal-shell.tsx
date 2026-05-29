import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import type { CurrentUser } from "@/lib/auth";

const ROLE_LABEL: Record<CurrentUser["role"], string> = {
  siswa: "Siswa",
  guru: "Guru",
  admin: "Admin",
};

export function PortalShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-clay-cream font-sans text-clay-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="clay-sm grid size-11 place-items-center bg-clay-sun text-xl">
            🎭
          </span>
          <span className="text-xl font-black tracking-tight">
            Wayang<span className="text-clay-rose">Folkids</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black leading-tight">{user.name}</p>
            <p className="text-xs font-bold text-clay-ink/60">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 pb-12">{children}</main>
    </div>
  );
}
