import type { ZodError } from "zod";

import type { FormActionState } from "@/lib/types";

export const initialFormState: FormActionState = {
  status: "idle",
};

export function collectFields(formData: FormData, fieldNames: string[]) {
  return fieldNames.reduce<Record<string, string>>((accumulator, fieldName) => {
    const value = formData.get(fieldName);
    accumulator[fieldName] = typeof value === "string" ? value : "";
    return accumulator;
  }, {});
}

export function validationErrorState(
  error: ZodError,
  fields: Record<string, string>,
  message = "Please correct the highlighted fields and try again.",
): FormActionState {
  return {
    status: "error",
    message,
    errors: error.flatten().fieldErrors,
    fields,
  };
}

export function errorState(
  message: string,
  fields?: Record<string, string>,
): FormActionState {
  return {
    status: "error",
    message,
    fields,
  };
}

export function successState(
  message: string,
  fields?: Record<string, string>,
  redirectTo?: string,
): FormActionState {
  return {
    status: "success",
    message,
    fields,
    redirectTo,
  };
}
