import { AgentRegisterForm } from "@/components/forms/agent-register-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function AgentRegisterPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Marketer onboarding"
      title="Register a trusted field marketer."
      description="Fundtrust keeps registration simple so new marketers can start collecting with the right identity details and secured credentials."
      checklist={[
        "Capture the marketer’s full name, phone number, address, and gender.",
        "Store passwords as hashes in the shared staff sheet rather than plain text.",
        "Make the new account immediately available for portal sign-in.",
      ]}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Marketer registration
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Create a marketer account
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          This flow adds a new marketer to the shared Google Sheet securely.
        </p>
        <div className="mt-8">
          <AgentRegisterForm />
        </div>
      </div>
    </AuthShell>
  );
}
