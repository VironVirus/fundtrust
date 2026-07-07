"use server";

import { revalidatePath } from "next/cache";

import {
  collectFields,
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-state";
import { requireAdminSession } from "@/lib/auth";
import { updateCustomer } from "@/lib/sheets";
import type { FormActionState } from "@/lib/types";
import { customerUpdateSchema } from "@/lib/validators";

const customerFields = [
  "id",
  "dateJoined",
  "name",
  "address",
  "sex",
  "age",
  "phone",
  "email",
  "savingsTarget",
  "savingsDuration",
  "weeklyPayment",
  "balanceToComplete",
  "totalAmount",
];

export async function updateCustomerAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminSession();

  const fields = collectFields(formData, customerFields);
  const parsed = customerUpdateSchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  try {
    await updateCustomer(parsed.data);

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/transactions");
    revalidatePath("/customer/dashboard");

    return successState("Customer details updated successfully.");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The customer record could not be updated.";

    return errorState(message, fields);
  }
}
