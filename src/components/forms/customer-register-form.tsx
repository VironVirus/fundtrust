"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerCustomerAction } from "@/actions/auth";
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
  getCustomerIdPreview,
} from "@/lib/customer-options";
import { formatDayStamp } from "@/lib/format";

export function CustomerRegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    registerCustomerAction,
    initialFormState,
  );
  const [branch, setBranch] = useState(state.fields?.branch ?? "");
  const [contributionType, setContributionType] = useState(
    state.fields?.contributionType ?? "",
  );

  useEffect(() => {
    if (state.fields?.branch !== undefined) {
      setBranch(state.fields.branch);
    }

    if (state.fields?.contributionType !== undefined) {
      setContributionType(state.fields.contributionType);
    }

  }, [state.fields?.branch, state.fields?.contributionType]);
  const customerIdPreview = getCustomerIdPreview(branch, contributionType);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push(state.redirectTo || "/login");
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state.message, state.redirectTo, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="weeklyPayment"
        value="0"
      />
      <input type="hidden" name="savingsTarget" value="0" />
      <input type="hidden" name="savingsDuration" value="0" />
      <input type="hidden" name="balanceToComplete" value="0" />
      <input type="hidden" name="totalAmount" value="0" />

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Chinwe Okeke"
          defaultValue={state.fields?.name ?? ""}
        />
        <FieldError message={state.errors?.name?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="12 Palm Avenue, Enugu"
          defaultValue={state.fields?.address ?? ""}
        />
        <FieldError message={state.errors?.address?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select id="sex" name="sex" defaultValue={state.fields?.sex ?? ""}>
            <option value="">Select sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          <FieldError message={state.errors?.sex?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="35"
            defaultValue={state.fields?.age ?? ""}
          />
          <FieldError message={state.errors?.age?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateJoined">Date joined</Label>
          <Input
            id="dateJoined"
            name="dateJoined"
            type="date"
            defaultValue={state.fields?.dateJoined ?? formatDayStamp()}
          />
          <FieldError message={state.errors?.dateJoined?.[0]} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="branch">Closest branch</Label>
          <Select
            id="branch"
            name="branch"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
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
            value={contributionType}
            onChange={(event) => setContributionType(event.target.value)}
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

      <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50/80 p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
          Customer ID preview
        </p>
        <p className="mt-2 font-semibold text-sky-950">
          {customerIdPreview || "Select a branch and plan type to preview the ID"}
        </p>
        <p className="mt-2 text-sky-900/80">Preview updates after branch and plan type are selected.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
          />
          <FieldError message={state.errors?.password?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
          <FieldError message={state.errors?.confirmPassword?.[0]} />
        </div>
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Submitting details..." className="w-full">
        Create profile
      </SubmitButton>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Login here
        </Link>
      </p>
    </form>
  );
}
