import { AgentLoginForm } from "@/components/forms/agent-login-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function AgentLoginPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Marketer portal"
      title="Secure sign-in for field collections."
      description="Marketers can capture daily deposits, review their own collections, and print clean daily reports from a mobile-friendly dashboard."
      checklist={[
        "Record deposits against customers already stored in the shared Google Sheet.",
        "See today’s collections, total value handled, and recent transaction history.",
        "Print end-of-day reports without exposing admin-only controls.",
      ]}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Marketer sign in
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Use your registered phone number and password to continue.
        </p>
        <div className="mt-8">
          <AgentLoginForm />
        </div>
      </div>
    </AuthShell>
  );
}
