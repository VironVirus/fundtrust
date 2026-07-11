import { NextResponse } from "next/server";

import { createQueryString, parseTransactionFilters } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { createExcelWorkbook } from "@/lib/excel";
import { formatDateTime } from "@/lib/format";
import { getTransactions } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const filters = parseTransactionFilters(Object.fromEntries(searchParams.entries()));
  const transactions = await getTransactions(filters);

  const workbook = createExcelWorkbook([
    {
      name: "Transactions",
      rows: [
        ["Date", "Marketer", "Customer", "Customer ID", "Payment method", "Amount"],
        ...transactions.map((transaction) => [
          formatDateTime(transaction.date),
          transaction.agentName,
          transaction.customerName,
          transaction.customerId,
          formatTransactionType(transaction.type),
          transaction.amount,
        ]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["Metric", "Value"],
        ["Matching transactions", transactions.length],
        [
          "Total value",
          transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
        ],
        ["Generated at", formatDateTime(new Date().toISOString())],
      ],
    },
  ]);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="fundtrust-transactions${
        createQueryString(filters) ? "-filtered" : ""
      }.xls"`,
    },
  });
}
