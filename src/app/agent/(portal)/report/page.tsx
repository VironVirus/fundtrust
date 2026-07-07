import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";

import { DocumentTitle } from "@/components/shared/document-title";
import { EmptyState } from "@/components/shared/empty-state";
import { PrintButton } from "@/components/shared/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAgentSession } from "@/lib/auth";
import { summarizeTransactions } from "@/lib/analytics";
import {
  createDailyReportFileName,
  formatCurrency,
  formatLongDateWithOrdinal,
  getCalendarDate,
} from "@/lib/format";
import { getTransactionLedgerRows } from "@/lib/reporting";
import { getAgentById, getTransactions } from "@/lib/sheets";

type AgentReportPageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function AgentReportPage({
  searchParams,
}: AgentReportPageProps) {
  const session = await requireAgentSession();
  const params = await searchParams;
  const selectedDate = params.date || getCalendarDate();
  const [transactions, agent] = await Promise.all([
    getTransactions({
      agentId: session.userId,
      startDate: selectedDate,
      endDate: selectedDate,
    }),
    getAgentById(session.userId),
  ]);
  const summary = summarizeTransactions(transactions);
  const ledgerRows = getTransactionLedgerRows(transactions);
  const marketerBranch = agent?.branch || session.branch || "Not set";
  const reportFileName = createDailyReportFileName(session.name, selectedDate);

  return (
    <main className="space-y-6">
      <DocumentTitle title={reportFileName} />

      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Daily report
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {reportFileName}
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Print this page directly or export the same report layout as a CSV
              file.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 print:hidden">
            <Button asChild variant="outline">
              <Link href="/agent/dashboard">Back to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/api/agent/report/export?date=${selectedDate}`}>
                <Download className="h-4 w-4" />
                Export CSV
              </Link>
            </Button>
            <PrintButton />
          </div>
        </div>
      </section>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Choose a report date</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={selectedDate} />
            </div>
            <Button type="submit">Load report</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Printable daily report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-[1.5rem] border border-border/70 bg-slate-50 p-5">
            <div className="space-y-3">
              {[
                ["Marketer's Name", session.name],
                ["Marketer's Branch", marketerBranch],
                ["Date", formatLongDateWithOrdinal(selectedDate)],
                [
                  "Total number of transactions",
                  summary.count.toLocaleString("en-NG"),
                ],
                ["Total cash", formatCurrency(summary.cashTotal)],
                ["Total transfers", formatCurrency(summary.transferTotal)],
                ["Grand total", formatCurrency(summary.totalAmount)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-2 border-b border-border/60 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-base font-semibold text-foreground sm:text-right">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {ledgerRows.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Type of Transaction</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerRows.map((row) => (
                    <TableRow key={`${row.customerId}-${row.serialNumber}`}>
                      <TableCell>{row.serialNumber}</TableCell>
                      <TableCell>{row.customerId}</TableCell>
                      <TableCell>{row.transactionType}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="rounded-[1.5rem] border border-primary/20 bg-primary/6 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Grand total
                </p>
                <p className="mt-3 text-lg font-semibold leading-8 text-foreground">
                  {formatCurrency(summary.totalAmount)}
                </p>
              </div>
            </>
          ) : (
            <EmptyState
              title="No collections found"
              description="There were no deposits recorded for this date."
              icon={ReceiptText}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
