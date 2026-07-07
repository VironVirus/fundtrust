import {
  Building2,
  Hash,
  ReceiptText,
  UserSquare2,
  Wallet,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
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
import { getCustomerStatus } from "@/lib/customer-status";
import { requireCustomerSession } from "@/lib/auth";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/format";
import { getCustomerById, getTransactions } from "@/lib/sheets";
import { formatTransactionType } from "@/lib/transaction-options";

export default async function CustomerDashboardPage() {
  const session = await requireCustomerSession();
  const customer = await getCustomerById(session.userId);

  if (!customer) {
    return (
      <main className="space-y-6">
        <EmptyState
          title="Customer profile not found"
          description="We could not find the customer record tied to this session. Please sign in again or contact support."
          icon={UserSquare2}
        />
      </main>
    );
  }

  const transactions = await getTransactions({ customerId: customer.id });
  const customerStatus = getCustomerStatus(customer);
  const latestTransaction = transactions[0];

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Customer dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Hello, {customer.name}
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Review your customer ID, total saved so far, and recent contribution
          activity.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Badge variant="success">Customer ID {customer.id}</Badge>
          <Badge
            variant={customerStatus === "Active" ? "default" : "success"}
          >
            {customerStatus}
          </Badge>
          {customer.branch ? <Badge variant="outline">{customer.branch}</Badge> : null}
          {customer.contributionType ? (
            <Badge variant="outline">{customer.contributionType}</Badge>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total saved"
          value={formatCurrency(customer.totalAmount)}
          hint="Total amount recorded so far"
          icon={ReceiptText}
        />
        <StatCard
          title="Deposits"
          value={transactions.length.toLocaleString("en-NG")}
          hint="All recorded contribution entries"
          icon={UserSquare2}
        />
        <StatCard
          title="Last contribution"
          value={latestTransaction ? formatDate(latestTransaction.date) : "None yet"}
          hint={
            latestTransaction
              ? `${formatCurrency(latestTransaction.amount)} via ${formatTransactionType(
                  latestTransaction.type,
                ).toLowerCase()}`
              : "No contribution recorded yet"
          }
          icon={Wallet}
        />
        <StatCard
          title="Customer ID"
          value={customer.id}
          hint="Share this when a marketer records deposits"
          icon={Hash}
        />
        <StatCard
          title="Closest branch"
          value={customer.branch || "Not set"}
          hint={customer.contributionType || "Plan type not set"}
          icon={Building2}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>
              These details are pulled from your customer sheet record.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Contact
              </p>
              <p className="mt-2 text-foreground">{customer.phone}</p>
              <p className="text-foreground">{customer.email}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Address
              </p>
              <p className="mt-2 text-foreground">{customer.address}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Joined
              </p>
              <p className="mt-2 text-foreground">{formatDate(customer.dateJoined)}</p>
              <p className="text-muted-foreground">
                {customer.sex} • {customer.age} years
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Account details
              </p>
              <p className="mt-2 text-foreground">
                Branch: {customer.branch || "Not set"}
              </p>
              <p className="text-foreground">
                Plan type: {customer.contributionType || "Not set"}
              </p>
              <p className="text-foreground">Customer ID: {customer.id}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Contributions
              </p>
              <p className="mt-2 text-foreground">
                Total saved: {formatCurrency(customer.totalAmount)}
              </p>
              <p className="text-muted-foreground">
                Customers can keep contributing at any time without a fixed
                target limit.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent contribution history</CardTitle>
            <CardDescription>
              Your latest deposits as recorded by Fundtrust marketers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Marketer</TableHead>
                    <TableHead>Payment method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.date)}</TableCell>
                      <TableCell>{transaction.agentName}</TableCell>
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
                title="No deposits yet"
                description="Once a contribution has been recorded for your profile, it will appear here."
                icon={ReceiptText}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
