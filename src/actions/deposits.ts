"use server";

import { revalidatePath } from "next/cache";

import {
  collectFields,
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-state";
import { requireAgentSession } from "@/lib/auth";
import { logWhatsAppDiagnostic } from "@/lib/whatsapp-diagnostics";
import { sendDepositConfirmationEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/format";
import { isAppsScriptConfigured, recordDeposit } from "@/lib/sheets";
import type { FormActionState } from "@/lib/types";
import { formatTransactionType } from "@/lib/transaction-options";
import { depositSchema } from "@/lib/validators";
import { sendDepositWhatsApp } from "@/lib/whatsapp";

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

  if (!isAppsScriptConfigured()) {
    return errorState(
      "Apps Script backend is not configured yet. Add APPS_SCRIPT_WEB_APP_URL to .env.local.",
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

      setTimeout(() => {
        void sendDepositConfirmationEmail(emailPayload).catch((error) => {
          console.error("Fundtrust deposit email failed", error);
        });
      }, 0);
    }

    if (updatedCustomer.phone) {
      const whatsappPayload = {
        customerName: updatedCustomer.name,
        phone: updatedCustomer.phone,
        marketerName: session.name,
        amount: parsed.data.amount,
        paymentMethod: parsed.data.paymentMethod,
        date: new Date().toISOString(),
      };

      try {
        await sendDepositWhatsApp(whatsappPayload);
      } catch (error) {
        console.error("Fundtrust deposit WhatsApp failed", error);
        await logWhatsAppDiagnostic("deposit", whatsappPayload, error);
        message += " WhatsApp alert could not be sent right now.";

        if (process.env.NODE_ENV !== "production" && error instanceof Error) {
          message += ` Detail: ${error.message}`;
        }
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
