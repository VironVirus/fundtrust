"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { submitContactFormAction } from "@/actions/contact";
import { FieldError } from "@/components/forms/field-error";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState } from "@/lib/action-state";

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    submitContactFormAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Your name"
            defaultValue={state.fields?.name ?? ""}
          />
          <FieldError message={state.errors?.name?.[0]} />
        </div>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="hello@company.com"
          defaultValue={state.fields?.email ?? ""}
        />
        <FieldError message={state.errors?.email?.[0]} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us what you need help with."
          defaultValue={state.fields?.message ?? ""}
        />
        <FieldError message={state.errors?.message?.[0]} />
      </div>

      <FormMessage state={state} />

      <SubmitButton pendingLabel="Sending message..." className="w-full sm:w-auto">
        Send message
      </SubmitButton>
    </form>
  );
}
