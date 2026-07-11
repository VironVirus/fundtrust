import { LoginForm } from "@/components/forms/login-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function LoginPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Access"
      title="Login"
      description="Customers sign in here. Admin and marketer accounts are added by administrators and also use this login."
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Fundtrust
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h2>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </AuthShell>
  );
}
