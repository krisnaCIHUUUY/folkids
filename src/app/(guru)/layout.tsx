import { requireRole } from "@/lib/auth";
import { GuruNavbar } from "@/components/guru/guru-navbar";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["guru", "admin"]);

  return (
    <div className="min-h-screen bg-clay-cream font-sans text-clay-ink">
      <GuruNavbar user={user} />
      <main className="mx-auto max-w-7xl px-4 pb-16 md:px-6">{children}</main>
    </div>
  );
}
