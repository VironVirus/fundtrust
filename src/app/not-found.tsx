import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-lg rounded-[2rem] border border-border bg-card p-10 text-center shadow-xl shadow-slate-950/5">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-primary">
          404
        </p>
        <h1 className="font-display text-4xl text-foreground">
          This page could not be found.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          The page may have moved, or the link may be outdated. Use the home
          page to get back into the right flow.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
