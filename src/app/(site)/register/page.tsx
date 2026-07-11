import { CustomerRegisterForm } from "@/components/forms/customer-register-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function RegisterPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Customer"
      title="Create account"
      description="Open a customer account to start tracking savings and receiving email updates."
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Customer
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Create account
        </h2>
        <div className="mt-8">
          <CustomerRegisterForm />
        </div>
      </div>
    </AuthShell>
  );
}
