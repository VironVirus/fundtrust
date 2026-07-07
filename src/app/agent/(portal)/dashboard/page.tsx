import Link from "next/link";
import { ArrowRight, ReceiptText, ScrollText, UserCircle2, Wallet } from "lucide-react";

import { DepositForm } from "@/components/forms/deposit-form";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { requireAgentSession } from "@/lib/auth";
import { getAgentDashboardData } from "@/lib/analytics";
import { formatCurrency, formatDateTime, getCalendarDate } from "@/lib/format";
import { getCustomers } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

export default async function AgentDashboardPage() {
  const session = await requireAgentSession();
  const [{ stats, recentTransactions }, customers] = await Promise.all([
    getAgentDashboardData(session.userId),
    getCustomers(),
  ]);
  const today = getCalendarDate();

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Marketer dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Welcome back, {session.name}
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Record today’s collections, track your totals, and print a clean
              end-of-day report.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/agent/report?date=${today}`}>Today&apos;s report</Link>
            </Button>
            <Button asChild>
              <Link href="/agent/report">
                View daily report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today"
          value={formatCurrency(stats.todayCollections)}
          hint="Collected so far today"
          icon={Wallet}
        />
        <StatCard
          title="Total handled"
          value={formatCurrency(stats.totalCollected)}
          hint="All-time value for this marketer"
          icon={ReceiptText}
        />
        <StatCard
          title="Transactions"
          value={stats.totalTransactions.toLocaleString("en-NG")}
          hint="Deposits recorded by this account"
          icon={ScrollText}
        />
        <StatCard
          title="Customers served"
          value={stats.customersServed.toLocaleString("en-NG")}
          hint="Unique customers reached"
          icon={UserCircle2}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Record a deposit</CardTitle>
            <CardDescription>
              Search an existing customer, enter the amount, choose cash or
              transfer, and submit. The customer balance and transaction sheet
              will update automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length > 0 ? (
              <DepositForm customers={customers} />
            ) : (
              <EmptyState
                title="No customers available"
                description="Add customers to the Google Sheet before marketers start recording deposits."
                icon={UserCircle2}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              Your latest deposit activity appears here in reverse chronological
              order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
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
            ) : (
              <EmptyState
                title="No transactions yet"
                description="As soon as this marketer records a deposit, the transaction log will appear here."
                icon={ReceiptText}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
