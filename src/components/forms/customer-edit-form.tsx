"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updateCustomerAction } from "@/actions/customers";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { initialFormState } from "@/lib/action-state";
import type { Customer } from "@/lib/types";

type CustomerEditFormProps = {
  customer: Customer;
};

export function CustomerEditForm({ customer }: CustomerEditFormProps) {
  const [state, formAction] = useActionState(
    updateCustomerAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={customer.id} />
      <input type="hidden" name="dateJoined" value={customer.dateJoined} />
      <input type="hidden" name="savingsTarget" value="0" />
      <input type="hidden" name="savingsDuration" value="0" />
      <input type="hidden" name="weeklyPayment" value="0" />
      <input type="hidden" name="balanceToComplete" value="0" />

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer ID</Label>
          <Input id="customerId" value={customer.id} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerBranch">Branch</Label>
          <Input
            id="customerBranch"
            value={customer.branch || "Not set"}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPlan">Plan type</Label>
          <Input
            id="customerPlan"
            value={customer.contributionType || "Not set"}
            readOnly
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Branch and plan type stay locked after registration so the customer ID
        remains consistent across reports and deposits.
      </p>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={state.fields?.name ?? customer.name}
        />
        <FieldError message={state.errors?.name?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={state.fields?.address ?? customer.address}
        />
        <FieldError message={state.errors?.address?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select
            id="sex"
            name="sex"
            defaultValue={state.fields?.sex ?? customer.sex}
          >
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
            defaultValue={state.fields?.age ?? String(customer.age)}
          />
          <FieldError message={state.errors?.age?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={state.fields?.phone ?? customer.phone}
          />
          <FieldError message={state.errors?.phone?.[0]} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={state.fields?.email ?? customer.email}
        />
        <FieldError message={state.errors?.email?.[0]} />
      </div>

      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
        Fundtrust is currently using open-ended contributions. Customers can
        keep funding without a savings target or balance cap.
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAmount">Total saved</Label>
        <Input
          id="totalAmount"
          name="totalAmount"
          type="number"
          step="0.01"
          defaultValue={state.fields?.totalAmount ?? String(customer.totalAmount)}
        />
        <FieldError message={state.errors?.totalAmount?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton
        pendingLabel="Saving changes..."
        className="w-full sm:w-auto"
      >
        Save customer changes
      </SubmitButton>
    </form>
  );
}
