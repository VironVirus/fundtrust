import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createCsv } from "@/lib/csv";
import {
  createDailyReportFileName,
  formatCurrency,
  formatLongDateWithOrdinal,
  getCalendarDate,
} from "@/lib/format";
import { getTransactionLedgerRows } from "@/lib/reporting";
import { getAgentById, getTransactions } from "@/lib/sheets";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "agent") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const selectedDate = searchParams.get("date") || getCalendarDate();
  const [transactions, agent] = await Promise.all([
    getTransactions({
      agentId: session.userId,
      startDate: selectedDate,
      endDate: selectedDate,
    }),
    getAgentById(session.userId),
  ]);
  const ledgerRows = getTransactionLedgerRows(transactions);
  const totalCash = transactions
    .filter((transaction) => transaction.type === "cash")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalTransfers = transactions
    .filter((transaction) => transaction.type === "transfer")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const grandTotal = totalCash + totalTransfers;
  const fileName = `${createDailyReportFileName(session.name, selectedDate)}.csv`;

  const csv = createCsv([
    ["Marketer's Name", session.name],
    ["Marketer's Branch", agent?.branch || session.branch || "Not set"],
    ["Date", formatLongDateWithOrdinal(selectedDate)],
    ["Total Number of Transactions", ledgerRows.length],
    ["Total Cash", formatCurrency(totalCash)],
    ["Total Transfers", formatCurrency(totalTransfers)],
    ["Grand Total", formatCurrency(grandTotal)],
    [],
    ["Serial Number", "Customer ID", "Type of Transaction", "Amount"],
    ...ledgerRows.map((row) => [
      row.serialNumber,
      row.customerId,
      row.transactionType,
      formatCurrency(row.amount),
    ]),
    [],
    ["GRAND TOTAL", formatCurrency(grandTotal)],
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
