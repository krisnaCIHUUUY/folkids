import { requireRole } from "@/lib/auth";
import { PortalShell } from "@/components/layout/portal-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["admin"]);
  return <PortalShell user={user}>{children}</PortalShell>;
}
