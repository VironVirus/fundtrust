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
import { clearSession, createSession, requireAdminSession } from "@/lib/auth";
import { sendCustomerWelcomeEmail } from "@/lib/email";
import { getEnv } from "@/lib/env";
import {
  createAdmin,
  createAgent,
  createCustomer,
  getAdminByLogin,
  getAgentByPhone,
  getCustomerByIdentifier,
  getCustomerByPhoneAndEmail,
  isSupabaseConfigured,
} from "@/lib/sheets";
import type { FormActionState, SessionUser } from "@/lib/types";
import {
  adminCreationSchema,
  adminLoginSchema,
  agentLoginSchema,
  agentRegistrationSchema,
  customerLoginSchema,
  customerRegistrationSchema,
  sharedLoginSchema,
} from "@/lib/validators";

const sharedLoginFields = ["identifier", "password"];
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
const adminCreationFields = [
  "name",
  "login",
  "email",
  "password",
  "confirmPassword",
];
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
  "password",
  "confirmPassword",
];

function normalizeText(value: string) {
  return value.trim();
}

function normalizePhone(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function getRedirectPath(role: "admin" | "agent" | "customer") {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "agent") {
    return "/agent/dashboard";
  }

  return "/customer/dashboard";
}

async function authenticateWithSharedLogin(
  identifier: string,
  password: string,
) {
  const env = getEnv();
  const normalizedIdentifier = normalizeText(identifier);
  const normalizedIdentifierLower = normalizedIdentifier.toLowerCase();
  const normalizedPhone = normalizePhone(identifier);
  const candidates: Array<{
    session: SessionUser;
    passwordHash: string;
    status: string;
    missingPasswordMessage?: string;
  }> = [];

  if (normalizedIdentifierLower === env.ADMIN_LOGIN.trim().toLowerCase()) {
    candidates.push({
      session: {
        role: "admin",
        userId: "bootstrap-admin",
        name: "Fundtrust Admin",
        email: env.ADMIN_EMAIL,
      },
      passwordHash: env.ADMIN_PASSWORD_HASH,
      status: "Active",
    });
  }

  if (isSupabaseConfigured()) {
    const [admin, agent, customer] = await Promise.all([
      getAdminByLogin(normalizedIdentifier),
      getAgentByPhone(normalizedPhone),
      getCustomerByIdentifier(normalizedIdentifier),
    ]);

    if (admin) {
      candidates.push({
        session: {
          role: "admin",
          userId: admin.id,
          name: admin.name,
          email: admin.email,
        },
        passwordHash: admin.passwordHash,
        status: admin.status,
      });
    }

    if (agent) {
      candidates.push({
        session: {
          role: "agent",
          userId: agent.id,
          name: agent.name,
          phone: agent.phone,
          branch: agent.branch,
        },
        passwordHash: agent.passwordHash,
        status: agent.status,
      });
    }

    if (customer) {
      candidates.push({
        session: {
          role: "customer",
          userId: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          branch: customer.branch,
        },
        passwordHash: customer.passwordHash,
        status: customer.status,
        missingPasswordMessage:
          "This customer account needs a password before it can sign in. Please contact an administrator.",
      });
    }
  } else if (candidates.length === 0) {
    throw new Error(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
    );
  }

  let sawInactiveAccount = false;
  let missingPasswordMessage: string | null = null;

  for (const candidate of candidates) {
    if (candidate.status.toLowerCase() !== "active") {
      sawInactiveAccount = true;
      continue;
    }

    if (!candidate.passwordHash) {
      missingPasswordMessage ??= candidate.missingPasswordMessage || null;
      continue;
    }

    const passwordMatches = await compare(password, candidate.passwordHash);

    if (!passwordMatches) {
      continue;
    }

    return {
      role: candidate.session.role,
      redirectTo: getRedirectPath(candidate.session.role),
      session: candidate.session,
    };
  }

  if (missingPasswordMessage) {
    throw new Error(missingPasswordMessage);
  }

  if (sawInactiveAccount) {
    throw new Error(
      "This account is not active. Please contact an administrator.",
    );
  }

  throw new Error("Invalid login credentials.");
}

export async function loginAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const fields = collectFields(formData, sharedLoginFields);
  const parsed = sharedLoginSchema.safeParse(fields);

  if (!parsed.success) {
    return validationErrorState(parsed.error, fields);
  }

  try {
    const result = await authenticateWithSharedLogin(
      parsed.data.identifier,
      parsed.data.password,
    );

    await createSession(result.session);

    return successState(
      `Welcome back, ${result.session.name}.`,
      fields,
      result.redirectTo,
    );
  } catch (error) {
    return errorState(
      error instanceof Error ? error.message : "Login could not be completed.",
      fields,
    );
  }
}

export async function registerAgentAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminSession();

  const fields = collectFields(formData, agentRegistrationFields);
  const parsed = agentRegistrationSchema.safeParse(fields);

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
      "Marketer account created. The marketer can now sign in.",
    );
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Marketer account could not be created.",
      fields,
    );
  }
}

export async function createAdminAction(
  _previousState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  await requireAdminSession();

  const fields = collectFields(formData, adminCreationFields);
  const parsed = adminCreationSchema.safeParse(fields);

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
    const env = getEnv();
    const requestedLogin = parsed.data.login.trim().toLowerCase();

    if (requestedLogin === env.ADMIN_LOGIN.trim().toLowerCase()) {
      return errorState(
        "That login is already reserved for the primary admin account.",
        fields,
      );
    }

    const existingAdmin = await getAdminByLogin(requestedLogin);

    if (existingAdmin) {
      return errorState(
        "An administrator with that login already exists.",
        fields,
      );
    }

    const passwordHash = await hash(parsed.data.password, 10);

    await createAdmin({
      name: parsed.data.name,
      login: requestedLogin,
      email: parsed.data.email,
      passwordHash,
      status: "Active",
    });

    revalidatePath("/admin/admins");

    return successState(
      "Administrator account created. The new admin can now sign in.",
    );
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Administrator account could not be created.",
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

  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
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

  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
      fields,
    );
  }

  try {
    const {
      confirmPassword: _confirmPassword,
      password,
      ...customerInput
    } = parsed.data;
    const passwordHash = await hash(password, 10);
    const customer = await createCustomer({
      ...customerInput,
      passwordHash,
    });

    revalidatePath("/admin/customers");

    let message = `Customer created. ID: ${customer.id}.`;

    if (customer.email) {
      const emailPayload = {
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        branch: customer.branch || "Not set",
        contributionType: customer.contributionType || "Not set",
        dateJoined: customer.dateJoined,
      };

      try {
        await sendCustomerWelcomeEmail(emailPayload);
        message += " Welcome email queued.";
      } catch (error) {
        console.error("Fundtrust welcome email failed", error);
        message += " Welcome email could not be queued.";
      }
    }

    return successState(message, undefined, "/login");
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

  if (!isSupabaseConfigured()) {
    return errorState(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
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
        "No customer matched those details.",
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
