import { CustomerRegisterForm } from "@/components/forms/customer-register-form";
import { AuthShell } from "@/components/shared/auth-shell";
import { redirectAuthenticatedUser } from "@/lib/auth";

export default async function CustomerRegisterPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthShell
      eyebrow="Customer onboarding"
      title="Submit your contribution profile online."
      description="This registration form captures the customer details stored in the Fundtrust sheet, including branch, plan type, and the savings values used to calculate weekly payment automatically."
      checklist={[
        "Collect name, address, sex, age, phone number, and email address.",
        "Capture branch, plan type, savings target, and savings duration.",
        "Generate the customer ID automatically in the backend so records stay consistent.",
      ]}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Customer registration
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Submit your details
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          This form writes directly into the customer sheet through the Apps
          Script backend.
        </p>
        <div className="mt-8">
          <CustomerRegisterForm />
        </div>
      </div>
    </AuthShell>
  );
}
