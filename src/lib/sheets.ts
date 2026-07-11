import "server-only";

import {
  getCustomerBranchCode,
  getCustomerContributionTypeCode,
  normalizeCustomerBranch,
  normalizeCustomerContributionType,
} from "@/lib/customer-options";
import {
  coerceNumber,
  getNowIsoString,
  isDateWithinRange,
} from "@/lib/format";
import { supabaseInsert, supabaseRpc, supabaseSelect, supabaseUpdate } from "@/lib/supabase";
import type {
  Admin,
  AdminAccount,
  Agent,
  Customer,
  CustomerAccount,
  Transaction,
  TransactionFilters,
} from "@/lib/types";
import {
  formatTransactionType,
  normalizeTransactionType,
  type TransactionPaymentMethod,
} from "@/lib/transaction-options";
import { matchesSearch } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase";

type CustomerRow = {
  id: string;
  name: string;
  address: string;
  sex: string;
  age: string | number;
  phone: string;
  email: string;
  branch: string;
  contribution_type: string;
  savings_target: string | number;
  savings_duration: string | number;
  weekly_payment: string | number;
  balance_to_complete: string | number;
  total_amount: string | number;
  date_joined: string;
  password_hash?: string;
  status?: string;
};

type AgentRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  branch: string;
  gender: string;
  password_hash: string;
  date_registered: string;
  status: string;
};

type AdminRow = {
  id: string;
  name: string;
  login: string;
  email: string;
  password_hash: string;
  status: string;
  created_at: string;
};

type TransactionRow = {
  id: string;
  date: string;
  customer_id: string;
  customer_name: string;
  agent_id: string;
  agent_name: string;
  amount: string | number;
  type: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizePhone(value: unknown) {
  return normalizeText(value).replace(/\s+/g, "");
}

function toIsoDate(value: unknown, fallback = getNowIsoString()) {
  const rawValue = normalizeText(value);

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = new Date(rawValue);
  return Number.isNaN(parsedValue.getTime())
    ? fallback
    : parsedValue.toISOString();
}

function normalizeCustomer(row: Partial<CustomerRow>): Customer {
  const totalAmount = coerceNumber(row.total_amount);
  const balanceToComplete = coerceNumber(row.balance_to_complete);
  const savingsTarget = coerceNumber(row.savings_target);
  const savingsDuration = coerceNumber(row.savings_duration);
  const weeklyPayment = coerceNumber(row.weekly_payment);

  return {
    id: normalizeText(row.id),
    name: normalizeText(row.name),
    address: normalizeText(row.address),
    sex: normalizeText(row.sex) || "Other",
    age: coerceNumber(row.age),
    phone: normalizeText(row.phone),
    email: normalizeText(row.email),
    branch: normalizeCustomerBranch(row.branch),
    contributionType: normalizeCustomerContributionType(row.contribution_type),
    savingsTarget,
    savingsDuration,
    weeklyPayment,
    balanceToComplete,
    totalAmount,
    dateJoined: toIsoDate(row.date_joined),
  };
}

function normalizeCustomerAccount(row: Partial<CustomerRow>): CustomerAccount {
  return {
    ...normalizeCustomer(row),
    passwordHash: normalizeText(row.password_hash),
    status: normalizeText(row.status) || "Active",
  };
}

function normalizeAgent(row: Partial<AgentRow>): Agent {
  return {
    id: normalizeText(row.id),
    name: normalizeText(row.name),
    phone: normalizeText(row.phone),
    address: normalizeText(row.address),
    branch: normalizeCustomerBranch(row.branch),
    gender: normalizeText(row.gender) || "Other",
    passwordHash: normalizeText(row.password_hash),
    dateRegistered: toIsoDate(row.date_registered),
    status: normalizeText(row.status) || "Active",
  };
}

function normalizeAdmin(row: Partial<AdminRow>): AdminAccount {
  return {
    id: normalizeText(row.id),
    name: normalizeText(row.name),
    login: normalizeText(row.login).toLowerCase(),
    email: normalizeText(row.email).toLowerCase(),
    passwordHash: normalizeText(row.password_hash),
    status: normalizeText(row.status) || "Active",
    createdAt: toIsoDate(row.created_at),
  };
}

function normalizeTransaction(row: Partial<TransactionRow>): Transaction {
  return {
    id: normalizeText(row.id),
    date: toIsoDate(row.date),
    customerId: normalizeText(row.customer_id),
    customerName: normalizeText(row.customer_name),
    agentId: normalizeText(row.agent_id),
    agentName: normalizeText(row.agent_name),
    amount: coerceNumber(row.amount),
    type: normalizeTransactionType(row.type),
  };
}

function buildCustomerRow(
  customer: Pick<Customer, "id"> & Partial<Omit<Customer, "id">>,
  existingCustomer?: Customer | null,
) {
  const savingsTarget = coerceNumber(
    customer.savingsTarget ?? existingCustomer?.savingsTarget,
  );
  const savingsDuration = coerceNumber(
    customer.savingsDuration ?? existingCustomer?.savingsDuration,
  );
  const weeklyPayment =
    savingsTarget > 0 && savingsDuration > 0
      ? savingsTarget / savingsDuration
      : 0;

  return {
    id: normalizeText(customer.id || existingCustomer?.id),
    name: normalizeText(customer.name ?? existingCustomer?.name),
    address: normalizeText(customer.address ?? existingCustomer?.address),
    sex: normalizeText(customer.sex ?? existingCustomer?.sex) || "Other",
    age: coerceNumber(customer.age ?? existingCustomer?.age),
    phone: normalizeText(customer.phone ?? existingCustomer?.phone),
    email: normalizeText(customer.email ?? existingCustomer?.email),
    branch: normalizeCustomerBranch(customer.branch ?? existingCustomer?.branch),
    contribution_type: normalizeCustomerContributionType(
      customer.contributionType ?? existingCustomer?.contributionType,
    ),
    savings_target: savingsTarget,
    savings_duration: savingsDuration,
    weekly_payment: weeklyPayment,
    balance_to_complete: coerceNumber(
      customer.balanceToComplete ?? existingCustomer?.balanceToComplete,
    ),
    total_amount: coerceNumber(customer.totalAmount ?? existingCustomer?.totalAmount),
    date_joined: toIsoDate(customer.dateJoined ?? existingCustomer?.dateJoined),
  };
}

function buildCustomerCreatePayload(
  customer: Omit<Customer, "id"> & { passwordHash: string },
) {
  return {
    name: normalizeText(customer.name),
    address: normalizeText(customer.address),
    sex: normalizeText(customer.sex) || "Other",
    age: coerceNumber(customer.age),
    phone: normalizeText(customer.phone),
    email: normalizeText(customer.email),
    branch: normalizeCustomerBranch(customer.branch),
    contributionType: normalizeCustomerContributionType(customer.contributionType),
    savingsTarget: coerceNumber(customer.savingsTarget),
    savingsDuration: coerceNumber(customer.savingsDuration),
    weeklyPayment: coerceNumber(customer.weeklyPayment),
    balanceToComplete: coerceNumber(customer.balanceToComplete),
    totalAmount: coerceNumber(customer.totalAmount),
    dateJoined: toIsoDate(customer.dateJoined),
    passwordHash: normalizeText(customer.passwordHash),
  };
}

export async function getCustomers() {
  if (!isSupabaseConfigured()) {
    return [] as Customer[];
  }

  const searchParams = new URLSearchParams({
    select: "*",
    order: "name.asc",
  });
  const rows = await supabaseSelect<CustomerRow>("customers", searchParams);

  return rows.map((row) => normalizeCustomer(row));
}

export async function getCustomerById(customerId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const searchParams = new URLSearchParams({
    select: "*",
    id: `eq.${customerId}`,
    limit: "1",
  });
  const rows = await supabaseSelect<CustomerRow>("customers", searchParams);

  return rows[0] ? normalizeCustomer(rows[0]) : null;
}

export async function getCustomerByIdentifier(identifier: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedIdentifier = normalizeText(identifier);
  const normalizedPhone = normalizePhone(identifier);
  const normalizedEmail = normalizedIdentifier.toLowerCase();
  const searchParams = new URLSearchParams({
    select: "*",
  });
  const rows = await supabaseSelect<CustomerRow>("customers", searchParams);
  const customers = rows.map((row) => normalizeCustomerAccount(row));

  return (
    customers.find((customer) => {
      return (
        customer.id === normalizedIdentifier ||
        normalizePhone(customer.phone) === normalizedPhone ||
        customer.email.toLowerCase() === normalizedEmail
      );
    }) ?? null
  );
}

export async function getCustomerByPhoneAndEmail(
  phone: string,
  email: string,
  branch: string,
  contributionType: string,
) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedBranch = normalizeCustomerBranch(branch);
  const normalizedContributionType = normalizeCustomerContributionType(
    contributionType,
  );
  const customers = await getCustomers();

  return (
    customers.find((customer) => {
      const matchesBranch = !normalizedBranch || customer.branch === normalizedBranch;
      const matchesContributionType =
        !normalizedContributionType ||
        customer.contributionType === normalizedContributionType;

      return (
        normalizePhone(customer.phone) === normalizedPhone &&
        customer.email.toLowerCase() === normalizedEmail &&
        matchesBranch &&
        matchesContributionType
      );
    }) ?? null
  );
}

export async function createCustomer(
  customer: Omit<Customer, "id"> & { passwordHash: string },
) {
  const result = await supabaseRpc<CustomerRow | CustomerRow[]>(
    "fundtrust_create_customer",
    {
      customer_payload: buildCustomerCreatePayload(customer),
    },
  );
  const row = Array.isArray(result) ? result[0] : result;

  return normalizeCustomer(row);
}

export async function updateCustomer(
  customer: Pick<Customer, "id"> & Partial<Omit<Customer, "id">>,
) {
  const existingCustomer = await getCustomerById(customer.id);

  if (!existingCustomer) {
    throw new Error("Customer record not found.");
  }

  const row = buildCustomerRow(customer, existingCustomer);
  const searchParams = new URLSearchParams({
    id: `eq.${customer.id}`,
  });
  const rows = await supabaseUpdate<CustomerRow>("customers", row, searchParams);

  if (!rows[0]) {
    throw new Error("Customer record not found.");
  }

  return normalizeCustomer(rows[0]);
}

export async function recordDeposit(input: {
  customerId: string;
  amount: number;
  agentId: string;
  agentName: string;
  paymentMethod: TransactionPaymentMethod;
}) {
  const result = await supabaseRpc<CustomerRow | CustomerRow[]>(
    "fundtrust_record_deposit",
    {
      p_customer_id: input.customerId,
      p_amount: input.amount,
      p_agent_id: input.agentId,
      p_agent_name: input.agentName,
      p_payment_method: input.paymentMethod,
    },
  );
  const row = Array.isArray(result) ? result[0] : result;

  return normalizeCustomer(row);
}

export async function getAgents() {
  if (!isSupabaseConfigured()) {
    return [] as Agent[];
  }

  const searchParams = new URLSearchParams({
    select: "*",
    order: "name.asc",
  });
  const rows = await supabaseSelect<AgentRow>("agents", searchParams);

  return rows.map((row) => normalizeAgent(row));
}

export async function getAgentById(agentId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const searchParams = new URLSearchParams({
    select: "*",
    id: `eq.${agentId}`,
    limit: "1",
  });
  const rows = await supabaseSelect<AgentRow>("agents", searchParams);

  return rows[0] ? normalizeAgent(rows[0]) : null;
}

export async function getAgentByPhone(phone: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedPhone = normalizePhone(phone);
  const agents = await getAgents();

  return (
    agents.find((agent) => normalizePhone(agent.phone) === normalizedPhone) ?? null
  );
}

export async function createAgent(agent: Omit<Agent, "id" | "dateRegistered">) {
  const branchCode = getCustomerBranchCode(agent.branch);

  if (!branchCode) {
    throw new Error("A valid marketer branch is required.");
  }

  const rows = await supabaseInsert<AgentRow>("agents", {
    name: normalizeText(agent.name),
    phone: normalizeText(agent.phone),
    address: normalizeText(agent.address),
    branch: normalizeCustomerBranch(agent.branch),
    gender: normalizeText(agent.gender) || "Other",
    password_hash: normalizeText(agent.passwordHash),
    status: normalizeText(agent.status) || "Active",
  });

  return rows[0] ? normalizeAgent(rows[0]) : null;
}

export async function getAdmins() {
  if (!isSupabaseConfigured()) {
    return [] as Admin[];
  }

  const searchParams = new URLSearchParams({
    select: "*",
    order: "name.asc",
  });
  const rows = await supabaseSelect<AdminRow>("admins", searchParams);

  return rows.map((row) => {
    const admin = normalizeAdmin(row);

    return {
      id: admin.id,
      name: admin.name,
      login: admin.login,
      email: admin.email,
      status: admin.status,
      createdAt: admin.createdAt,
    };
  });
}

export async function getAdminByLogin(login: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const normalizedLogin = normalizeText(login).toLowerCase();
  const searchParams = new URLSearchParams({
    select: "*",
  });
  const rows = await supabaseSelect<AdminRow>("admins", searchParams);
  const admins = rows.map((row) => normalizeAdmin(row));

  return admins.find((admin) => admin.login === normalizedLogin) ?? null;
}

export async function createAdmin(
  admin: Omit<AdminAccount, "id" | "createdAt">,
) {
  const rows = await supabaseInsert<AdminRow>("admins", {
    name: normalizeText(admin.name),
    login: normalizeText(admin.login).toLowerCase(),
    email: normalizeText(admin.email).toLowerCase(),
    password_hash: normalizeText(admin.passwordHash),
    status: normalizeText(admin.status) || "Active",
  });

  return rows[0] ? normalizeAdmin(rows[0]) : null;
}

export async function getTransactions(filters?: TransactionFilters) {
  if (!isSupabaseConfigured()) {
    return [] as Transaction[];
  }

  const searchParams = new URLSearchParams({
    select: "*",
    order: "date.desc",
  });

  if (filters?.agentId) {
    searchParams.set("agent_id", `eq.${filters.agentId}`);
  }

  if (filters?.customerId) {
    searchParams.set("customer_id", `eq.${filters.customerId}`);
  }

  const rows = await supabaseSelect<TransactionRow>("transactions", searchParams);
  const query = normalizeText(filters?.query);

  return rows
    .map((row) => normalizeTransaction(row))
    .filter((transaction) => {
      if (
        !isDateWithinRange(
          transaction.date,
          filters?.startDate,
          filters?.endDate,
        )
      ) {
        return false;
      }

      if (
        query &&
        !matchesSearch(transaction.customerName, query) &&
        !matchesSearch(transaction.customerId, query) &&
        !matchesSearch(transaction.agentName, query) &&
        !matchesSearch(transaction.type, query) &&
        !matchesSearch(formatTransactionType(transaction.type), query)
      ) {
        return false;
      }

      return true;
    })
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    );
}

export { isSupabaseConfigured };
