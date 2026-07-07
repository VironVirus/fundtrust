"use client";

import { useActionState, useDeferredValue, useEffect, useRef, useState } from "react";
import { Search, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";

import { recordDepositAction } from "@/actions/deposits";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { initialFormState } from "@/lib/action-state";
import { formatCurrency } from "@/lib/format";
import { transactionTypeOptions } from "@/lib/transaction-options";
import type { Customer } from "@/lib/types";
import { matchesSearch } from "@/lib/utils";

type DepositFormProps = {
  customers: Customer[];
};

export function DepositForm({ customers }: DepositFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    recordDepositAction,
    initialFormState,
  );
  const [query, setQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (state.fields?.customerId) {
      setSelectedCustomerId(state.fields.customerId);
    }
  }, [state.fields?.customerId]);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
      setQuery("");
      setSelectedCustomerId("");
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;
  const filteredCustomers = deferredQuery
    ? customers
        .filter(
          (customer) =>
            matchesSearch(customer.id, deferredQuery) ||
            matchesSearch(customer.name, deferredQuery) ||
            matchesSearch(customer.phone, deferredQuery) ||
            matchesSearch(customer.email, deferredQuery),
        )
        .slice(0, 6)
    : [];

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="customerId"
        value={selectedCustomer?.id ?? state.fields?.customerId ?? ""}
      />

      <div className="space-y-2">
        <Label htmlFor="customer-search">Search customer</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-search"
            placeholder="Search by customer ID, name, phone, or email"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!event.target.value) {
                setSelectedCustomerId("");
              }
            }}
            className="pl-10"
          />
        </div>
        <FieldError message={state.errors?.customerId?.[0]} />
      </div>

      {selectedCustomer ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {selectedCustomer.name}
              </p>
              <p className="text-sm text-emerald-700">
                ID {selectedCustomer.id} • {selectedCustomer.phone} •{" "}
                {selectedCustomer.email}
              </p>
              <p className="text-sm text-emerald-700">
                {selectedCustomer.branch || "Branch not set"} •{" "}
                {selectedCustomer.contributionType || "Plan not set"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCustomerId("");
                setQuery("");
              }}
              className="text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline"
            >
              Change customer
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Total saved
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {formatCurrency(selectedCustomer.totalAmount)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Contribution mode
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {selectedCustomer.contributionType || "Not set"}
              </p>
            </div>
          </div>
        </div>
      ) : query ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-white/70">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  setSelectedCustomerId(customer.id);
                  setQuery(customer.name);
                }}
                className="flex w-full items-center justify-between gap-4 border-b border-border/60 px-4 py-4 text-left transition last:border-none hover:bg-accent/70"
              >
                <div>
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID {customer.id} • {customer.phone} • {customer.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customer.branch || "Branch not set"} •{" "}
                    {customer.contributionType || "Plan not set"}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary">
                  {formatCurrency(customer.balanceToComplete)}
                </span>
              </button>
            ))
          ) : (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-muted-foreground">
              <UserRoundSearch className="h-4 w-4" />
              No customer matched that search.
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="amount">Deposit amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="1"
          placeholder="5000"
          defaultValue={state.fields?.amount ?? ""}
        />
        <FieldError message={state.errors?.amount?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Funding method</Label>
        <Select
          id="paymentMethod"
          name="paymentMethod"
          defaultValue={state.fields?.paymentMethod ?? ""}
        >
          <option value="">Select payment method</option>
          {transactionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <FieldError message={state.errors?.paymentMethod?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Recording deposit..." className="w-full">
        Record deposit and notify customer
      </SubmitButton>
    </form>
  );
}
