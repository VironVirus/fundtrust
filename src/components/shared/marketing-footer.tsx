import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Create account" },
  { href: "/login", label: "Login" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/70 bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Fundtrust
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Daily savings management with customer self-service and admin-controlled staff access.
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
