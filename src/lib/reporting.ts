import type { Transaction } from "@/lib/types";
import { formatTransactionType } from "@/lib/transaction-options";

function sortTransactionsByTime(transactions: Transaction[]) {
  return [...transactions].sort(
    (left, right) =>
      new Date(left.date).getTime() - new Date(right.date).getTime(),
  );
}

export function buildTransactionSections(transactions: Transaction[]) {
  const sortedTransactions = sortTransactionsByTime(transactions);
  const cashTransactions = sortedTransactions.filter(
    (transaction) => transaction.type === "cash",
  );
  const transferTransactions = sortedTransactions.filter(
    (transaction) => transaction.type === "transfer",
  );
  const totalCash = cashTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const totalTransfer = transferTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const grandTotal = totalCash + totalTransfer;

  return {
    cashTransactions,
    transferTransactions,
    totalCash,
    totalTransfer,
    grandTotal,
    totalTransactions: sortedTransactions.length,
    sortedTransactions,
  };
}

export function getTransactionLedgerRows(transactions: Transaction[]) {
  return sortTransactionsByTime(transactions).map((transaction, index) => ({
    serialNumber: index + 1,
    customerId: transaction.customerId,
    transactionType: formatTransactionType(transaction.type),
    amount: transaction.amount,
  }));
}
