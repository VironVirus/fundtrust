import Link from "next/link";
import { Download } from "lucide-react";

import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getTransactions } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

type TransactionPrintPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TransactionPrintPage({
  searchParams,
}: TransactionPrintPageProps) {
  const params = await searchParams;
  const filters = parseTransactionFilters(params);
  const transactions = await getTransactions(filters);
  const summary = summarizeTransactions(transactions);
  const queryString = createQueryString(filters);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/92 p-6 shadow-xl shadow-slate-950/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Printable transaction report
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Filtered transaction ledger
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {summary.count.toLocaleString("en-NG")} records • {formatCurrency(summary.totalAmount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button asChild variant="outline">
              <Link href="/admin/transactions">Back</Link>
            </Button>
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
            <PrintButton />
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
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
        </CardContent>
      </Card>
    </main>
  );
}
