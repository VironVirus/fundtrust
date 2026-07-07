import { MailCheck, SearchCheck, Wallet2 } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Find the customer and record payment",
    description:
      "A marketer searches by name, phone number, or customer ID, selects the customer, enters the amount, and submits the deposit.",
    icon: SearchCheck,
  },
  {
    title: "Fundtrust updates balances instantly",
    description:
      "The server action updates the customer balance, creates a transaction row in Google Sheets, and revalidates dashboards.",
    icon: Wallet2,
  },
  {
    title: "Customer confirmation and reporting",
    description:
      "A receipt email can be sent automatically, while daily reports and admin dashboards stay current for review and export.",
    icon: MailCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            How it works
          </p>
          <h1 className="mt-4 font-display text-5xl text-foreground">
            A simple operating rhythm for daily collections.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Fundtrust keeps the process lightweight for field teams while still
            giving administrators the accountability and reporting depth they
            need.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-white/70 bg-white/88">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Step {index + 1}
                </p>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
