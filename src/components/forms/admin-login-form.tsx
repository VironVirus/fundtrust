"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { adminLoginAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/action-state";

export function AdminLoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(adminLoginAction, initialFormState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.push("/admin/dashboard");
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [router, state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login">Admin login</Label>
        <Input
          id="login"
          name="login"
          placeholder="admin"
          defaultValue={state.fields?.login ?? ""}
        />
        <FieldError message={state.errors?.login?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" />
        <FieldError message={state.errors?.password?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Access admin portal
      </SubmitButton>
    </form>
  );
}
