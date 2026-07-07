import Link from "next/link";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Building2,
  Landmark,
  LockKeyhole,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  TimerReset,
  WalletCards,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Trusted collections",
    description:
      "Daily marketer deposits update balances, record transactions, and prepare customer-ready receipts from one workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Sheets-powered operations",
    description:
      "Your operations team keeps Google Sheets as the source of truth while the app adds a secure product layer on top.",
    icon: Building2,
  },
  {
    title: "Professional reporting",
    description:
      "Track today’s collections, marketer performance, customer balances, and export-ready transaction ledgers.",
    icon: Landmark,
  },
];

const processSteps = [
  {
    title: "Register and onboard",
    description:
      "Customers submit their profile, branch, and savings plan once, then receive a trackable customer code.",
    icon: Sparkles,
  },
  {
    title: "Collect with control",
    description:
      "Marketers search by customer code, choose cash or transfer, and post deposits in seconds from the field.",
    icon: PiggyBank,
  },
  {
    title: "Reconcile faster",
    description:
      "Admin teams review live balances, print daily summaries, and export clean records for audits or branch reviews.",
    icon: ChartNoAxesCombined,
  },
];

const portalCards = [
  {
    title: "Customer access",
    description:
      "Customers can review savings targets, weekly expectations, and their latest contribution history in one place.",
    href: "/customer/login",
    cta: "Customer login",
    icon: WalletCards,
  },
  {
    title: "Marketer workspace",
    description:
      "Mobile-first collection tools help field teams record funding type, print daily reports, and stay accountable.",
    href: "/agent/login",
    cta: "Open marketer portal",
    icon: TimerReset,
  },
  {
    title: "Admin control",
    description:
      "See total collections, remaining balances, customer progress, and export-ready ledgers without touching the raw sheet.",
    href: "/admin/login",
    cta: "Enter admin portal",
    icon: LockKeyhole,
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm shadow-primary/8">
              <ShieldCheck className="h-3.5 w-3.5" />
              Daily contribution platform
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-foreground sm:text-6xl">
              Clear collections, calmer operations, and stronger customer trust.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Fundtrust helps savings teams run daily contributions with a more
              professional front office, faster marketer workflows, and cleaner
              reporting across customers, branches, and administrators.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/customer/register">
                  Create a customer profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/agent/login">
                  Marketer portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/admin/login">Admin dashboard</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <StatCard
                title="Collection method"
                value="Cash or transfer"
                hint="Each deposit now records how the customer paid."
                icon={PiggyBank}
              />
              <StatCard
                title="Customer updates"
                value="Instant"
                hint="Balances, totals, and receipts update right away."
                icon={WalletCards}
              />
              <StatCard
                title="Operational source"
                value="Google Sheets"
                hint="Your existing sheet remains the live backend."
                icon={Landmark}
              />
            </div>
          </div>

          <Card className="overflow-hidden border-white/70 bg-white/92 shadow-2xl shadow-slate-950/8">
            <CardHeader className="border-b border-border/60 bg-[radial-gradient(circle_at_top_right,rgba(86,214,177,0.14),transparent_26%),linear-gradient(180deg,rgba(13,69,102,0.08),rgba(255,255,255,0.96))]">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <ChartNoAxesCombined className="h-3.5 w-3.5" />
                Operations preview
              </div>
              <CardTitle className="mt-4 text-2xl">
                What a strong collection day looks like
              </CardTitle>
              <CardDescription>
                Marketers, customers, and administrators stay aligned around one
                verified savings trail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Today’s deposits",
                    value: "₦248,000",
                    note: "Field activity rolls up by marketer and by day.",
                  },
                  {
                    label: "Customers tracked",
                    value: "Live balances",
                    note: "Savings target, total saved, and balance left stay visible.",
                  },
                  {
                    label: "Funding type",
                    value: "Cash / Transfer",
                    note: "Reports split totals by payment method automatically.",
                  },
                  {
                    label: "Customer trust",
                    value: "Email receipts",
                    note: "Each posted deposit can notify the customer instantly.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.45rem] border border-border/70 bg-slate-50/92 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.note}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.45rem] border border-primary/12 bg-primary/6 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Built for field teams
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Fundtrust is designed to keep day-to-day collections simple in
                  the field while giving head-office teams a cleaner, more
                  printable record at the end of each day.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Why teams trust Fundtrust
            </p>
            <h2 className="mt-4 font-display text-4xl text-foreground">
              Professional structure for daily collection businesses
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {highlights.map((item) => (
              <Card key={item.title} className="border-white/70 bg-white/90 shadow-lg shadow-slate-950/6">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-border/70 bg-white/88 p-6 shadow-xl shadow-slate-950/6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Built for every role
            </p>
            <h2 className="mt-4 font-display text-4xl text-foreground">
              One platform, three clean workspaces
            </h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {portalCards.map((item) => (
              <Card key={item.title} className="border-border/70 bg-slate-50/92">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline">
                    <Link href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-border/70 bg-slate-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            How it flows
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">
                    0{index + 1}
                  </div>
                  <step.icon className="h-4 w-4 text-emerald-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Button asChild variant="secondary">
              <Link href="/how-it-works">
                Explore the full workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
