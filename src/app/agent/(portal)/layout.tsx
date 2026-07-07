import { PortalShell } from "@/components/shared/portal-shell";
import { requireAgentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AgentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAgentSession();

  return (
    <PortalShell role="agent" session={session}>
      {children}
    </PortalShell>
  );
}
