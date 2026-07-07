import { getCalendarDate } from "@/lib/format";
import { getCustomerStatus } from "@/lib/customer-status";
import { getAgents, getCustomers, getTransactions } from "@/lib/sheets";
import type { Transaction, TransactionFilters } from "@/lib/types";

export function parseTransactionFilters(
  searchParams: Record<string, string | string[] | undefined>,
): TransactionFilters {
  const pickValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return {
    query: pickValue(searchParams.query)?.trim() || undefined,
    startDate: pickValue(searchParams.startDate) || undefined,
    endDate: pickValue(searchParams.endDate) || undefined,
    agentId: pickValue(searchParams.agentId) || undefined,
    customerId: pickValue(searchParams.customerId) || undefined,
  };
}

export function createQueryString(filters: TransactionFilters) {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
}

export function summarizeTransactions(transactions: Transaction[]) {
  const summary = transactions.reduce(
    (totals, transaction) => {
      totals.totalAmount += transaction.amount;
      if (transaction.type === "transfer") {
        totals.transferCount += 1;
        totals.transferTotal += transaction.amount;
      } else {
        totals.cashCount += 1;
        totals.cashTotal += transaction.amount;
      }

      return totals;
    },
    {
      totalAmount: 0,
      cashTotal: 0,
      transferTotal: 0,
      cashCount: 0,
      transferCount: 0,
    },
  );

  return {
    count: transactions.length,
    totalAmount: summary.totalAmount,
    cashTotal: summary.cashTotal,
    transferTotal: summary.transferTotal,
    cashCount: summary.cashCount,
    transferCount: summary.transferCount,
    averageAmount: transactions.length
      ? summary.totalAmount / transactions.length
      : 0,
  };
}

export async function getAdminDashboardData() {
  const [customers, agents, transactions] = await Promise.all([
    getCustomers(),
    getAgents(),
    getTransactions(),
  ]);

  const today = getCalendarDate();
  const currentMonth = today.slice(0, 7);
  const todayTransactions = transactions.filter(
    (transaction) => getCalendarDate(transaction.date) === today,
  );
  const monthTransactions = transactions.filter((transaction) =>
    getCalendarDate(transaction.date).startsWith(currentMonth),
  );

  const marketerTotals = new Map<
    string,
    {
      marketerId: string;
      marketerName: string;
      collections: number;
      value: number;
    }
  >();

  for (const transaction of transactions) {
    const current = marketerTotals.get(transaction.agentId) ?? {
      marketerId: transaction.agentId,
      marketerName: transaction.agentName,
      collections: 0,
      value: 0,
    };

    current.collections += 1;
    current.value += transaction.amount;
    marketerTotals.set(transaction.agentId, current);
  }

  return {
    overview: {
      totalCustomers: customers.length,
      totalMarketers: agents.length,
      activeMarketers: agents.filter(
        (agent) => agent.status.toLowerCase() === "active",
      ).length,
      amountDepositedToday: todayTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      ),
      totalDeposits: transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      ),
      customersWithDeposits: customers.filter(
        (customer) => customer.totalAmount > 0,
      ).length,
      monthlyCollections: monthTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      ),
    },
    recentTransactions: transactions.slice(0, 8),
    topMarketers: Array.from(marketerTotals.values())
      .sort((left, right) => right.value - left.value)
      .slice(0, 5),
    activityWatch: [...customers]
      .sort((left, right) => right.totalAmount - left.totalAmount)
      .slice(0, 5)
      .map((customer) => ({
        ...customer,
        status: getCustomerStatus(customer),
      })),
  };
}

export async function getAgentDashboardData(agentId: string) {
  const transactions = await getTransactions({ agentId });
  const today = getCalendarDate();
  const todayTransactions = transactions.filter(
    (transaction) => getCalendarDate(transaction.date) === today,
  );

  return {
    todayTransactions,
    recentTransactions: transactions.slice(0, 10),
    stats: {
      todayCollections: todayTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      ),
      totalCollected: transactions.reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      ),
      totalTransactions: transactions.length,
      customersServed: new Set(transactions.map((item) => item.customerId)).size,
    },
  };
}
