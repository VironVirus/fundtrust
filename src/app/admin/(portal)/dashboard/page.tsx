import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Download,
  PiggyBank,
  Users,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboardData } from "@/lib/analytics";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { formatTransactionType } from "@/lib/transaction-options";

export default async function AdminDashboardPage() {
  const { overview, recentTransactions, topMarketers, activityWatch } =
    await getAdminDashboardData();

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">View customers, marketers, and transactions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/customers">Manage customers</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/admin/dashboard/export">
                <Download className="h-4 w-4" />
                Export workbook
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/transactions">
                Open transactions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Customers"
          value={overview.totalCustomers.toLocaleString("en-NG")}
          hint="Registered customers"
          icon={Users}
        />
        <StatCard
          title="Marketers"
          value={overview.totalMarketers.toLocaleString("en-NG")}
          hint={`${overview.activeMarketers.toLocaleString("en-NG")} active`}
          icon={Building2}
        />
        <StatCard
          title="Deposited today"
          value={formatCurrency(overview.amountDepositedToday)}
          hint="Today"
          icon={CircleDollarSign}
        />
        <StatCard
          title="Total deposits"
          value={formatCurrency(overview.totalDeposits)}
          hint="All deposits"
          icon={CircleDollarSign}
        />
        <StatCard
          title="Customers funded"
          value={overview.customersWithDeposits.toLocaleString("en-NG")}
          hint="With deposits"
          icon={Users}
        />
        <StatCard
          title="This month"
          value={formatCurrency(overview.monthlyCollections)}
          hint="Monthly total"
          icon={PiggyBank}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Marketer</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Payment method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDateTime(transaction.date)}</TableCell>
                    <TableCell>{transaction.agentName}</TableCell>
                    <TableCell>{transaction.customerName}</TableCell>
                    <TableCell>{transaction.customerId}</TableCell>
                    <TableCell>{formatTransactionType(transaction.type)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top marketers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topMarketers.map((marketer) => (
              <div
                key={marketer.marketerId}
                className="rounded-[1.5rem] border border-border/70 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {marketer.marketerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {marketer.collections.toLocaleString("en-NG")} collections
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    {formatCurrency(marketer.value)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Customer activity watch</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total saved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityWatch.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.branch || "Not set"}</TableCell>
                  <TableCell>{customer.status}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(customer.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
