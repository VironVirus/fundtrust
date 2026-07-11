"use server";

import {
  collectFields,
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-state";
import { sendContactNotification } from "@/lib/email";
import type { FormActionState } from "@/lib/types";
import { contactMessageSchema } from "@/lib/validators";

const contactFields = ["name", "email", "phone", "message"];

export async function submitContactFormAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, contactFields);
  const parsed = contactMessageSchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  try {
    const delivery = await sendContactNotification(parsed.data);

    return successState(
      delivery.delivered
        ? "Your message has been received. A Fundtrust team member will follow up soon."
        : "Your message has been captured in preview mode.",
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not send your message right now.";

    return errorState(message, fields);
  }
}
