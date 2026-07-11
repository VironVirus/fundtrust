import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/card";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(86,214,177,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(58,130,246,0.18),transparent_28%),linear-gradient(155deg,#0b2031_0%,#0b3a54_48%,#0e6b53_100%)] p-8 text-white shadow-2xl shadow-slate-950/10 sm:p-10">
          <div className="absolute right-10 top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-28 w-28 rounded-full bg-emerald-400/15 blur-3xl" />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
              {description}
            </p>
          ) : null}
        </section>

        <Card className="self-center overflow-hidden border-white/70 bg-white/92 p-0 shadow-2xl shadow-slate-950/8">
          <div className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(16,99,77,0.08),rgba(255,255,255,0.82))] px-6 py-5 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Fundtrust
            </p>
          </div>
          <div className="p-6 sm:p-8">{children}</div>
        </Card>
      </div>
    </main>
  );
}
