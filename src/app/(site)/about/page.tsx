import { Building2, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  {
    title: "Customers",
    description: "Create profiles and track deposits.",
    icon: Users,
  },
  {
    title: "Marketers",
    description: "Record collections from one simple screen.",
    icon: Building2,
  },
  {
    title: "Admins",
    description: "Review balances, marketers, and transactions.",
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            About
          </p>
          <h1 className="mt-4 font-display text-5xl text-foreground">
            Fundtrust keeps daily savings work organized.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            It connects customer registration, deposit recording, email alerts, and reporting in one app.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title} className="border-white/70 bg-white/88">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="pt-3">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}
