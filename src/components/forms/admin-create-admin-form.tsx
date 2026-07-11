"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createAdminAction } from "@/actions/auth";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialFormState } from "@/lib/action-state";

export function AdminCreateAdminForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction] = useActionState(createAdminAction, initialFormState);

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
          placeholder="Fundtrust Supervisor"
          defaultValue={state.fields?.name ?? ""}
        />
        <FieldError message={state.errors?.name?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="login">Admin login</Label>
          <Input
            id="login"
            name="login"
            placeholder="supervisor"
            defaultValue={state.fields?.login ?? ""}
          />
          <FieldError message={state.errors?.login?.[0]} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@fundtrust.app"
            defaultValue={state.fields?.email ?? ""}
          />
          <FieldError message={state.errors?.email?.[0]} />
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

      <SubmitButton pendingLabel="Creating admin..." className="w-full">
        Create admin
      </SubmitButton>
    </form>
  );
}
