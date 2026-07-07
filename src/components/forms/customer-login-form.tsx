"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { customerLoginAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { initialFormState } from "@/lib/action-state";
import {
  customerBranchOptions,
  customerContributionTypeOptions,
} from "@/lib/customer-options";

export function CustomerLoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    customerLoginAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/customer/dashboard");
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="08012345678"
          defaultValue={state.fields?.phone ?? ""}
        />
        <FieldError message={state.errors?.phone?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          defaultValue={state.fields?.email ?? ""}
        />
        <FieldError message={state.errors?.email?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="branch">Closest branch</Label>
          <Select
            id="branch"
            name="branch"
            defaultValue={state.fields?.branch ?? ""}
          >
            <option value="">Select branch</option>
            {customerBranchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={state.errors?.branch?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contributionType">Plan type</Label>
          <Select
            id="contributionType"
            name="contributionType"
            defaultValue={state.fields?.contributionType ?? ""}
          >
            <option value="">Select plan type</option>
            {customerContributionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={state.errors?.contributionType?.[0]} />
        </div>
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Sign in to customer portal
      </SubmitButton>

      <p className="text-sm text-muted-foreground">
        New customer?{" "}
        <Link href="/customer/register" className="font-semibold text-primary">
          Submit your details
        </Link>
      </p>
    </form>
  );
}
