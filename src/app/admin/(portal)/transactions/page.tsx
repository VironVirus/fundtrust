import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createQueryString,
  parseTransactionFilters,
  summarizeTransactions,
} from "@/lib/analytics";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAgents, getCustomers, getTransactions } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

type TransactionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;
  const filters = parseTransactionFilters(params);
  const [agents, customers, transactions] = await Promise.all([
    getAgents(),
    getCustomers(),
    getTransactions(filters),
  ]);
  const summary = summarizeTransactions(transactions);
  const queryString = createQueryString(filters);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Transactions
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Filter, export, and print transaction activity
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Narrow down the ledger by date range, marketer, customer, or search
          term.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filter transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 xl:grid-cols-[1fr_170px_170px_220px_220px_auto_auto] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="query">Search</Label>
                <Input
                  id="query"
                  name="query"
                  placeholder="Marketer, customer, customer ID, or payment method"
                  defaultValue={filters.query ?? ""}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={filters.startDate ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={filters.endDate ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentId">Marketer</Label>
              <Select id="agentId" name="agentId" defaultValue={filters.agentId ?? ""}>
                <option value="">All marketers</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select
                id="customerId"
                name="customerId"
                defaultValue={filters.customerId ?? ""}
              >
                <option value="">All customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.id})
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Apply</Button>
            <Button asChild variant="outline">
              <Link href="/admin/transactions">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Matching transactions
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {summary.count.toLocaleString("en-NG")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Total value
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {formatCurrency(summary.totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Outputs
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Export filtered results or open the print view.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link
                  href={`/api/admin/transactions/export${
                    queryString ? `?${queryString}` : ""
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href={`/admin/transactions/print${
                    queryString ? `?${queryString}` : ""
                  }`}
                >
                  Print view
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Transaction ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
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
                {transactions.map((transaction) => (
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
          ) : (
            <EmptyState
              title="No transactions found"
              description="Try adjusting the active filters to see more results."
              icon={ReceiptText}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
