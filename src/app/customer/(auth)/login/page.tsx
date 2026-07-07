import { CustomerLoginForm } from "@/components/forms/customer-login-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function CustomerLoginPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Customer access"
      title="A simple way for customers to review their savings."
      description="Customers can sign in with their registered phone number, email address, branch, and plan type to track balances and contribution history."
      checklist={[
        "See your balance left, total saved, savings target, and current weekly payment.",
        "Review recent deposits recorded by your assigned marketers.",
        "Use the same customer profile details stored in the main Fundtrust sheet.",
      ]}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Customer sign in
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Use the phone number, email address, branch, and plan type attached to
          your customer profile.
        </p>
        <div className="mt-8">
          <CustomerLoginForm />
        </div>
      </div>
    </AuthShell>
  );
}
