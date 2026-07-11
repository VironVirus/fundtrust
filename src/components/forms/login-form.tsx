"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/action-state";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialFormState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push(state.redirectTo || "/customer/dashboard");
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state.message, state.redirectTo, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="identifier">Phone, email, customer ID, or admin login</Label>
        <Input
          id="identifier"
          name="identifier"
          placeholder="08012345678"
          defaultValue={state.fields?.identifier ?? ""}
        />
        <FieldError message={state.errors?.identifier?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" />
        <FieldError message={state.errors?.password?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Login
      </SubmitButton>

      <p className="text-sm text-muted-foreground">
        New customer?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Create account
        </Link>
      </p>
    </form>
  );
}
