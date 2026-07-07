import type {
  CustomerBranch,
  CustomerContributionType,
} from "@/lib/customer-options";
import type { TransactionPaymentMethod } from "@/lib/transaction-options";

export type SessionRole = "admin" | "agent" | "customer";

export type SessionUser = {
  role: SessionRole;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  branch?: CustomerBranch | "";
};

export type Customer = {
  id: string;
  name: string;
  address: string;
  sex: string;
  age: number;
  phone: string;
  email: string;
  branch: CustomerBranch | "";
  contributionType: CustomerContributionType | "";
  savingsTarget: number;
  savingsDuration: number;
  weeklyPayment: number;
  balanceToComplete: number;
  totalAmount: number;
  dateJoined: string;
};

export type Agent = {
  id: string;
  name: string;
  phone: string;
  address: string;
  branch: CustomerBranch | "";
  gender: string;
  passwordHash: string;
  dateRegistered: string;
  status: string;
};

export type Transaction = {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  amount: number;
  type: TransactionPaymentMethod;
};

export type TransactionFilters = {
  query?: string;
  startDate?: string;
  endDate?: string;
  agentId?: string;
  customerId?: string;
};

export type FormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  fields?: Record<string, string>;
};
