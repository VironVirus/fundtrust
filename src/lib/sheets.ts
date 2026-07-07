import "server-only";

import {
  normalizeCustomerBranch,
  normalizeCustomerContributionType,
} from "@/lib/customer-options";
import {
  coerceNumber,
  getNowIsoString,
  isDateWithinRange,
} from "@/lib/format";
import type {
  Agent,
  Customer,
  Transaction,
  TransactionFilters,
} from "@/lib/types";
import { callAppsScript, isAppsScriptConfigured } from "@/lib/apps-script";
import {
  formatTransactionType,
  normalizeTransactionType,
  type TransactionPaymentMethod,
} from "@/lib/transaction-options";
import { matchesSearch } from "@/lib/utils";

type CustomerSheetRow = {
  id: string;
  name: string;
  address: string;
  sex: string;
  age: string | number;
  phone: string;
  email: string;
  branch: string;
  contributionType: string;
  savingsTarget: string | number;
  savingsDuration: string | number;
  weeklyPayment: string | number;
  balanceToComplete: string | number;
  totalAmount: string | number;
  dateJoined: string;
};

type AgentSheetRow = {
  id: string;
  name: string;
  phone: string;
  address: string;
  branch: string;
  gender: string;
  passwordHash: string;
  dateRegistered: string;
  status: string;
};

type TransactionSheetRow = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  amount: string | number;
  type: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
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

function normalizeCustomer(row: Partial<CustomerSheetRow>): Customer {
  const totalAmount = coerceNumber(row.totalAmount);
  const balanceToComplete = coerceNumber(row.balanceToComplete);
  const savingsTarget = coerceNumber(row.savingsTarget);
  const savingsDuration = coerceNumber(row.savingsDuration);
  const weeklyPayment = coerceNumber(row.weeklyPayment);

  return {
    id: normalizeText(row.id),
    name: normalizeText(row.name),
    address: normalizeText(row.address),
    sex: normalizeText(row.sex) || "Other",
    age: coerceNumber(row.age),
    phone: normalizeText(row.phone),
    email: normalizeText(row.email),
    branch: normalizeCustomerBranch(row.branch),
    contributionType: normalizeCustomerContributionType(row.contributionType),
    savingsTarget,
    savingsDuration,
    weeklyPayment,
    balanceToComplete,
    totalAmount,
    dateJoined: toIsoDate(row.dateJoined),
  };
}

function normalizeAgent(row: Partial<AgentSheetRow>): Agent {
  return {
    id: normalizeText(row.id),
    name: normalizeText(row.name),
    phone: normalizeText(row.phone),
    address: normalizeText(row.address),
    branch: normalizeCustomerBranch(row.branch),
    gender: normalizeText(row.gender) || "Other",
    passwordHash: normalizeText(row.passwordHash),
    dateRegistered: toIsoDate(row.dateRegistered),
    status: normalizeText(row.status) || "Active",
  };
}

function normalizeTransaction(row: Partial<TransactionSheetRow>): Transaction {
  return {
    id: normalizeText(row.id),
    date: toIsoDate(row.date),
    customerId: normalizeText(row.customerId),
    customerName: normalizeText(row.customerName),
    agentId: normalizeText(row.agentId),
    agentName: normalizeText(row.agentName),
    amount: coerceNumber(row.amount),
    type: normalizeTransactionType(row.type),
  };
}

export async function getCustomers() {
  if (!isAppsScriptConfigured()) {
    return [] as Customer[];
  }

  const rows = await callAppsScript<Array<Partial<CustomerSheetRow>>>(
    "getCustomers",
  );

  return rows
    .map((row) => normalizeCustomer(row))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getCustomerById(customerId: string) {
  if (!isAppsScriptConfigured()) {
    return null;
  }

  const row = await callAppsScript<Partial<CustomerSheetRow> | null>(
    "getCustomerById",
    { customerId },
  );

  return row ? normalizeCustomer(row) : null;
}

export async function getCustomerByPhoneAndEmail(
  phone: string,
  email: string,
  branch: string,
  contributionType: string,
) {
  if (!isAppsScriptConfigured()) {
    return null;
  }

  const row = await callAppsScript<Partial<CustomerSheetRow> | null>(
    "getCustomerByPhoneAndEmail",
    { phone, email, branch, contributionType },
  );

  return row ? normalizeCustomer(row) : null;
}

export async function createCustomer(customer: Omit<Customer, "id">) {
  const row = await callAppsScript<Partial<CustomerSheetRow>>("createCustomer", {
    customer,
  });

  return normalizeCustomer(row);
}

export async function updateCustomer(
  customer: Pick<Customer, "id"> & Partial<Omit<Customer, "id">>,
) {
  const row = await callAppsScript<Partial<CustomerSheetRow>>("updateCustomer", {
    customer,
  });

  return normalizeCustomer(row);
}

export async function recordDeposit(input: {
  customerId: string;
  amount: number;
  agentId: string;
  agentName: string;
  paymentMethod: TransactionPaymentMethod;
}) {
  const row = await callAppsScript<Partial<CustomerSheetRow>>("recordDeposit", {
    deposit: input,
  });

  return normalizeCustomer(row);
}

export async function getAgents() {
  if (!isAppsScriptConfigured()) {
    return [] as Agent[];
  }

  const rows = await callAppsScript<Array<Partial<AgentSheetRow>>>("getAgents");

  return rows
    .map((row) => normalizeAgent(row))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getAgentById(agentId: string) {
  const agents = await getAgents();
  return agents.find((agent) => agent.id === agentId) ?? null;
}

export async function getAgentByPhone(phone: string) {
  if (!isAppsScriptConfigured()) {
    return null;
  }

  const row = await callAppsScript<Partial<AgentSheetRow> | null>(
    "getAgentByPhone",
    { phone },
  );

  return row ? normalizeAgent(row) : null;
}

export async function createAgent(agent: Omit<Agent, "id" | "dateRegistered">) {
  await callAppsScript<Partial<AgentSheetRow>>("createAgent", {
    agent,
  });
}

export async function getTransactions(filters?: TransactionFilters) {
  if (!isAppsScriptConfigured()) {
    return [] as Transaction[];
  }

  const rows = await callAppsScript<Array<Partial<TransactionSheetRow>>>(
    "getTransactions",
    { filters },
  );

  const query = normalizeText(filters?.query);

  return rows
    .map((row) => normalizeTransaction(row))
    .filter((transaction) => {
      if (filters?.agentId && transaction.agentId !== filters.agentId) {
        return false;
      }

      if (filters?.customerId && transaction.customerId !== filters.customerId) {
        return false;
      }

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

export { isAppsScriptConfigured };
