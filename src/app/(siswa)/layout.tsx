import { requireRole } from "@/lib/auth";
import { SiswaNavbar } from "@/components/siswa/siswa-navbar";

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["siswa"]);

  return (
    <div className="min-h-screen bg-clay-cream font-sans text-clay-ink">
      <SiswaNavbar user={user} />
      <main className="mx-auto max-w-7xl px-4 pb-16 md:px-6">{children}</main>
    </div>
  );
}
