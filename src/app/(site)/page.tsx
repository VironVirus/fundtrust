import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main>
      <section className="px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm shadow-primary/8">
              <ShieldCheck className="h-3.5 w-3.5" />
              Daily savings app
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-foreground sm:text-6xl">
              Simple daily savings management.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Customers can create an account and sign in. Marketers and admins are added internally by administrators.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/login">
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/70 bg-white/92 shadow-2xl shadow-slate-950/8">
            <CardHeader>
              <CardTitle>Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.45rem] border border-border/70 bg-slate-50/92 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Customers
                </p>
                <p className="mt-3 text-xl font-semibold text-foreground">
                  Create account or login
                </p>
              </div>
              <div className="rounded-[1.45rem] border border-border/70 bg-slate-50/92 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Staff
                </p>
                <p className="mt-3 text-xl font-semibold text-foreground">
                  Admins create marketer and admin accounts internally
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
