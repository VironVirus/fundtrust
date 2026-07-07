import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/contact", label: "Contact" },
  { href: "/customer/login", label: "Customer Login" },
  { href: "/agent/login", label: "Marketer Login" },
  { href: "/admin/login", label: "Admin Login" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/70 bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Fundtrust
          </p>
          <h2 className="mt-3 font-display text-3xl">
            A trustworthy operating system for daily contribution teams.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Built for agencies, collectors, marketers, and administrators who
            need clear reporting, accountable collection flows, and better
            customer trust.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
