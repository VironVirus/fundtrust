import { PortalShell } from "@/components/shared/portal-shell";
import { requireCustomerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCustomerSession();

  return (
    <PortalShell role="customer" session={session}>
      {children}
    </PortalShell>
  );
}
