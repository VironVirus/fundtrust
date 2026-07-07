"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  collectFields,
  errorState,
  successState,
  validationErrorState,
} from "@/lib/action-state";
import { clearSession, createSession } from "@/lib/auth";
import { sendCustomerWelcomeEmail } from "@/lib/email";
import { getEnv } from "@/lib/env";
import { logWhatsAppDiagnostic } from "@/lib/whatsapp-diagnostics";
import {
  createAgent,
  createCustomer,
  getAgentByPhone,
  getCustomerByPhoneAndEmail,
  isAppsScriptConfigured,
} from "@/lib/sheets";
import type { FormActionState } from "@/lib/types";
import {
  adminLoginSchema,
  agentLoginSchema,
  agentRegistrationSchema,
  customerLoginSchema,
  customerRegistrationSchema,
} from "@/lib/validators";
import { sendCustomerRegistrationWhatsApp } from "@/lib/whatsapp";

const agentLoginFields = ["phone", "password"];
const agentRegistrationFields = [
  "name",
  "phone",
  "address",
  "branch",
  "gender",
  "password",
  "confirmPassword",
];
const adminLoginFields = ["login", "password"];
const customerPortalFields = [
  "phone",
  "email",
  "branch",
  "contributionType",
];
const customerRegistrationFields = [
  "name",
  "address",
  "sex",
  "age",
  "phone",
  "email",
  "branch",
  "contributionType",
  "savingsTarget",
  "savingsDuration",
  "weeklyPayment",
  "balanceToComplete",
  "totalAmount",
  "dateJoined",
];

export async function registerAgentAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, agentRegistrationFields);
  const parsed = agentRegistrationSchema.safeParse(fields);

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
    const existingAgent = await getAgentByPhone(parsed.data.phone);

    if (existingAgent) {
      return errorState(
        "A marketer with that phone number already exists.",
        fields,
      );
    }

    const passwordHash = await hash(parsed.data.password, 10);

    await createAgent({
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      branch: parsed.data.branch,
      gender: parsed.data.gender,
      passwordHash,
      status: "Active",
    });

    revalidatePath("/admin/agents");

    return successState(
      "Registration successful. The new marketer can now sign in.",
    );
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Marketer registration could not be completed.",
      fields,
    );
  }
}

export async function agentLoginAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, agentLoginFields);
  const parsed = agentLoginSchema.safeParse(fields);

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
    const agent = await getAgentByPhone(parsed.data.phone);

    if (!agent) {
      return errorState(
        "No marketer account was found for that phone number.",
        fields,
      );
    }

    if (agent.status.toLowerCase() !== "active") {
      return errorState(
        "This marketer account is not active. Please contact an administrator.",
        fields,
      );
    }

    const passwordMatches = await compare(parsed.data.password, agent.passwordHash);

    if (!passwordMatches) {
      return errorState("Incorrect password. Please try again.", fields);
    }

    await createSession({
      role: "agent",
      userId: agent.id,
      name: agent.name,
      phone: agent.phone,
      branch: agent.branch,
    });

    return successState(`Welcome back, ${agent.name}.`);
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Marketer sign-in could not be completed.",
      fields,
    );
  }
}

export async function adminLoginAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, adminLoginFields);
  const parsed = adminLoginSchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  const env = getEnv();
  const loginMatches = parsed.data.login === env.ADMIN_LOGIN;
  const passwordMatches = await compare(
    parsed.data.password,
    env.ADMIN_PASSWORD_HASH,
  );

  if (!loginMatches || !passwordMatches) {
    return errorState("Invalid administrator credentials.", fields);
  }

  await createSession({
    role: "admin",
    userId: "admin",
    name: "Fundtrust Admin",
  });

  return successState("Administrator login successful.");
}

export async function registerCustomerAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, customerRegistrationFields);
  const parsed = customerRegistrationSchema.safeParse(fields);

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
    const customer = await createCustomer(parsed.data);

    revalidatePath("/admin/customers");

    let message = `Customer profile submitted successfully. Your customer ID is ${customer.id}. You can now sign in with your phone number, email, branch, and plan type.`;

    if (customer.email) {
      const emailPayload = {
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        branch: customer.branch || "Not set",
        contributionType: customer.contributionType || "Not set",
        dateJoined: customer.dateJoined,
      };

      setTimeout(() => {
        void sendCustomerWelcomeEmail(emailPayload).catch((error) => {
          console.error("Fundtrust welcome email failed", error);
        });
      }, 0);
    }

    if (customer.phone) {
      const whatsappPayload = {
        customerName: customer.name,
        customerId: customer.id,
        phone: customer.phone,
        branch: customer.branch || "Not set",
        contributionType: customer.contributionType || "Not set",
      };

      try {
        await sendCustomerRegistrationWhatsApp(whatsappPayload);
      } catch (error) {
        console.error("Fundtrust registration WhatsApp failed", error);
        await logWhatsAppDiagnostic("registration", whatsappPayload, error);
        message += " WhatsApp alert could not be sent right now.";

        if (process.env.NODE_ENV !== "production" && error instanceof Error) {
          message += ` Detail: ${error.message}`;
        }
      }
    }

    return successState(message);
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Customer registration could not be completed.",
      fields,
    );
  }
}

export async function customerLoginAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, customerPortalFields);
  const parsed = customerLoginSchema.safeParse(fields);

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
    const customer = await getCustomerByPhoneAndEmail(
      parsed.data.phone,
      parsed.data.email,
      parsed.data.branch,
      parsed.data.contributionType,
    );

    if (!customer) {
      return errorState(
        "No customer record matched that phone number, email, branch, and plan combination.",
        fields,
      );
    }

    await createSession({
      role: "customer",
      userId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    });

    return successState(`Welcome, ${customer.name}.`);
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Customer sign-in could not be completed.",
      fields,
    );
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
