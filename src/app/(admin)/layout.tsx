import { requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["admin"]);

  return (
    <div className="min-h-screen bg-clay-cream font-sans text-clay-ink md:flex">
      <AdminSidebar user={user} />
      <main id="main-content" className="min-w-0 flex-1 px-4 pb-16 pt-4 md:px-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
