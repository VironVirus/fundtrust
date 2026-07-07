"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { agentLoginAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/action-state";

export function AgentLoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(agentLoginAction, initialFormState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/agent/dashboard");
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
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
        />
        <FieldError message={state.errors?.password?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Sign in to marketer portal
      </SubmitButton>

      <p className="text-sm text-muted-foreground">
        New field marketer?{" "}
        <Link href="/agent/register" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
