import { requireRole } from "@/lib/auth";
import { getMyNotifications } from "@/lib/notifications";
import { GuruNavbar } from "@/components/guru/guru-navbar";

export default async function GuruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, notifications] = await Promise.all([
    requireRole(["guru", "admin"]),
    getMyNotifications(),
  ]);

  return (
    <div className="min-h-screen bg-clay-cream font-sans text-clay-ink">
      <GuruNavbar user={user} notifications={notifications} />
      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-16 md:px-6">{children}</main>
    </div>
  );
}
