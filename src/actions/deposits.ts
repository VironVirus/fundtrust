"use server";

import { revalidatePath } from "next/cache";

import {
  collectFields,
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-state";
import { requireAgentSession } from "@/lib/auth";
import { sendDepositConfirmationEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/format";
import { isSupabaseConfigured, recordDeposit } from "@/lib/sheets";
import type { FormActionState } from "@/lib/types";
import { formatTransactionType } from "@/lib/transaction-options";
import { depositSchema } from "@/lib/validators";

const depositFields = ["customerId", "amount", "paymentMethod"];

export async function recordDepositAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const session = await requireAgentSession();
  const fields = collectFields(formData, depositFields);
  const parsed = depositSchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
      fields,
    );
  }

  try {
    const updatedCustomer = await recordDeposit({
      customerId: parsed.data.customerId,
      amount: parsed.data.amount,
      agentId: session.userId,
      agentName: session.name,
      paymentMethod: parsed.data.paymentMethod,
    });

    revalidatePath("/agent/dashboard");
    revalidatePath("/agent/report");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/customers");
    revalidatePath("/admin/transactions");
    revalidatePath("/customer/dashboard");

    const paymentMethodLabel = formatTransactionType(
      parsed.data.paymentMethod,
    ).toLowerCase();
    let message = `Deposit of ${formatCurrency(parsed.data.amount)} recorded successfully via ${paymentMethodLabel}.`;

    if (updatedCustomer.email) {
      const emailPayload = {
        customerName: updatedCustomer.name,
        customerEmail: updatedCustomer.email,
        amount: parsed.data.amount,
        agentName: session.name,
        paymentMethod: parsed.data.paymentMethod,
        date: new Date().toISOString(),
      };

      try {
        await sendDepositConfirmationEmail(emailPayload);
        message += " Email receipt queued.";
      } catch (error) {
        console.error("Fundtrust deposit email failed", error);
        message += " Email receipt could not be queued.";
      }
    }

    return successState(message);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We could not complete the deposit right now.";

    return errorState(message, fields);
  }
}
