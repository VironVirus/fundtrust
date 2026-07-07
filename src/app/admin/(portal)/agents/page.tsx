import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getAgents, getTransactions } from "@/lib/sheets";

export default async function AgentsPage() {
  const [agents, transactions] = await Promise.all([getAgents(), getTransactions()]);

  const activityByAgent = new Map<
    string,
    { total: number; count: number; lastActivity: string | null }
  >();

  for (const transaction of transactions) {
    const current = activityByAgent.get(transaction.agentId) ?? {
      total: 0,
      count: 0,
      lastActivity: null,
    };

    current.total += transaction.amount;
    current.count += 1;
    current.lastActivity =
      !current.lastActivity || new Date(transaction.date) > new Date(current.lastActivity)
        ? transaction.date
        : current.lastActivity;

    activityByAgent.set(transaction.agentId, current);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Marketers
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Review every registered field marketer
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Track registration status, total collection value, and last activity
          from one central table.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Marketer directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Collections</TableHead>
                <TableHead className="text-right">Total value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => {
                const activity = activityByAgent.get(agent.id) ?? {
                  total: 0,
                  count: 0,
                  lastActivity: null,
                };

                return (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.address}</p>
                    </TableCell>
                    <TableCell>{agent.branch || "Not set"}</TableCell>
                    <TableCell>{agent.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          agent.status.toLowerCase() === "active"
                            ? "success"
                            : "outline"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p>{formatDateTime(agent.dateRegistered)}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.lastActivity
                          ? `Last activity ${formatDateTime(activity.lastActivity)}`
                          : "No collections yet"}
                      </p>
                    </TableCell>
                    <TableCell>{activity.count.toLocaleString("en-NG")}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(activity.total)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
