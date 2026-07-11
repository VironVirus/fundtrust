import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { getCustomerStatus } from "@/lib/customer-status";
import { createExcelWorkbook } from "@/lib/excel";
import { formatDateTime } from "@/lib/format";
import { getCustomers, getTransactions } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const [{ overview }, customers, transactions] = await Promise.all([
    getAdminDashboardData(),
    getCustomers(),
    getTransactions(),
  ]);

  const workbook = createExcelWorkbook([
    {
      name: "Overview",
      rows: [
        ["Metric", "Value"],
        ["Total customers", overview.totalCustomers],
        ["Total marketers", overview.totalMarketers],
        ["Active marketers", overview.activeMarketers],
        ["Amount deposited today", overview.amountDepositedToday],
        ["Total deposits", overview.totalDeposits],
        ["Customers with deposits", overview.customersWithDeposits],
        ["Monthly collections", overview.monthlyCollections],
        ["Generated at", formatDateTime(new Date().toISOString())],
      ],
    },
    {
      name: "Customers",
      rows: [
        [
          "Customer ID",
          "Name",
          "Phone",
          "Branch",
          "Plan Type",
          "Total Saved",
          "Status",
        ],
        ...customers.map((customer) => [
          customer.id,
          customer.name,
          customer.phone,
          customer.branch,
          customer.contributionType,
          customer.totalAmount,
          getCustomerStatus(customer),
        ]),
      ],
    },
    {
      name: "Transactions",
      rows: [
        ["Date", "Marketer", "Customer", "Customer ID", "Amount", "Payment method"],
        ...transactions.map((transaction) => [
          formatDateTime(transaction.date),
          transaction.agentName,
          transaction.customerName,
          transaction.customerId,
          transaction.amount,
          formatTransactionType(transaction.type),
        ]),
      ],
    },
  ]);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="fundtrust-admin-dashboard.xls"',
    },
  });
}
