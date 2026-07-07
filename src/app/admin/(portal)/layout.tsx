import { PortalShell } from "@/components/shared/portal-shell";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <PortalShell role="admin" session={session}>
      {children}
    </PortalShell>
  );
}
