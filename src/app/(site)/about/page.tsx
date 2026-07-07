import { CheckCircle2, HandCoins, ShieldCheck, Users } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const values = [
  {
    title: "Trust first",
    description:
      "Collections, balances, and confirmations are visible to the right people at the right time.",
    icon: ShieldCheck,
  },
  {
    title: "Marketer-friendly workflows",
    description:
      "Field marketers get a simple mobile-ready interface that reduces mistakes during daily rounds.",
    icon: HandCoins,
  },
  {
    title: "Operational clarity",
    description:
      "Admins can monitor performance, audit transactions, and correct customer balances without extra systems.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            About Fundtrust
          </p>
          <h1 className="mt-4 font-display text-5xl text-foreground">
            A more credible way to manage daily thrift savings.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Fundtrust was designed for contribution teams that already operate
            with spreadsheets but need a sharper, more dependable front end for
            marketers, customers, and administrators.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} className="border-white/70 bg-white/88 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <value.icon className="h-5 w-5" />
              </div>
              <CardHeader className="px-0 pb-0 pt-5">
                <CardTitle>{value.title}</CardTitle>
                <p className="text-sm leading-7 text-muted-foreground">
                  {value.description}
                </p>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="rounded-[2rem] border border-border/70 bg-slate-950 p-8 text-white">
          <h2 className="font-display text-3xl">What the platform solves</h2>
          <div className="mt-6 grid gap-4">
            {[
              "Unstructured deposit records spread across calls, notebooks, and chat messages.",
              "Slow end-of-day reconciliation for marketers and administrators.",
              "No reliable history when customers ask for balance confirmation.",
              "Weak reporting for printouts, audits, and performance reviews.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl bg-white/7 px-4 py-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
