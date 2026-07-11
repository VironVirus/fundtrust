"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerAgentAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { initialFormState } from "@/lib/action-state";
import { customerBranchOptions } from "@/lib/customer-options";

export function AdminCreateAgentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction] = useActionState(
    registerAgentAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
      router.refresh();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state.message, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Amina Okafor"
          defaultValue={state.fields?.name ?? ""}
        />
        <FieldError message={state.errors?.name?.[0]} />
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
          <Label htmlFor="branch">Branch</Label>
          <Select id="branch" name="branch" defaultValue={state.fields?.branch ?? ""}>
            <option value="">Select branch</option>
            {customerBranchOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={state.errors?.branch?.[0]} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" defaultValue={state.fields?.gender ?? ""}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Select>
          <FieldError message={state.errors?.gender?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="15 Market Road, Enugu"
            defaultValue={state.fields?.address ?? ""}
          />
          <FieldError message={state.errors?.address?.[0]} />
        </div>
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

      <SubmitButton pendingLabel="Creating marketer..." className="w-full">
        Create marketer
      </SubmitButton>
    </form>
  );
}
