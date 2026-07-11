import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { filterCustomers } from "@/lib/customer-filters";
import { getCustomerStatus } from "@/lib/customer-status";
import { createExcelWorkbook } from "@/lib/excel";
import { formatDateTime } from "@/lib/format";
import { getCustomers } from "@/lib/sheets";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const customers = await getCustomers();
  const filteredCustomers = filterCustomers(customers, {
    q: searchParams.get("q") ?? undefined,
    sex: searchParams.get("sex") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    branch: searchParams.get("branch") ?? undefined,
    contributionType: searchParams.get("contributionType") ?? undefined,
  });

  const workbook = createExcelWorkbook([
    {
      name: "Customers",
      rows: [
        [
          "Customer ID",
          "Name",
          "Phone",
          "Email",
          "Sex",
          "Age",
          "Branch",
          "Plan Type",
          "Total Saved",
          "Status",
          "Date Joined",
          "Address",
        ],
        ...filteredCustomers.map((customer) => [
          customer.id,
          customer.name,
          customer.phone,
          customer.email,
          customer.sex,
          customer.age,
          customer.branch,
          customer.contributionType,
          customer.totalAmount,
          getCustomerStatus(customer),
          formatDateTime(customer.dateJoined),
          customer.address,
        ]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["Metric", "Value"],
        ["Filtered customers", filteredCustomers.length],
        [
          "Total saved",
          filteredCustomers.reduce((sum, customer) => sum + customer.totalAmount, 0),
        ],
        [
          "Customers with deposits",
          filteredCustomers.filter((customer) => customer.totalAmount > 0).length,
        ],
        ["Generated at", formatDateTime(new Date().toISOString())],
      ],
    },
  ]);

  return new NextResponse(workbook, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="fundtrust-customers-filtered.xls"',
    },
  });
}
