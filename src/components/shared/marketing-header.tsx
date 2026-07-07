import Link from "next/link";

import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-lg shadow-primary/20">
            FT
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-foreground">
              Fundtrust
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Savings Platform
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-slate-50/90 p-1 shadow-sm shadow-slate-950/4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/customer/login">Customer Login</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/agent/login">Marketer Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/login">Admin Portal</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
