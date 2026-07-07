import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Admin control"
      title="Oversight for customers, marketers, and transactions."
      description="Administrators get full visibility into collections, customer balances, and transaction reporting while keeping Google credentials server-side."
      checklist={[
        "Review overview metrics for today’s collections and outstanding balances.",
        "Inspect customers, edit balances, and search transaction history with filters.",
        "Export or print transaction reports for reconciliation and audits.",
      ]}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Administrator sign in
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Access the control center
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Use the administrator credentials configured in your environment.
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </AuthShell>
  );
}
