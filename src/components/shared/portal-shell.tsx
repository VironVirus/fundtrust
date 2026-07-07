"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChartNoAxesCombined,
  Coins,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { LogoutForm } from "@/components/forms/logout-form";
import { Badge } from "@/components/ui/badge";
import type { SessionRole, SessionUser } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

type PortalShellProps = {
  role: SessionRole;
  session: SessionUser;
  children: React.ReactNode;
};

const navByRole = {
  agent: [
    { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agent/report", label: "Daily Report", icon: ReceiptText },
  ],
  customer: [
    { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/agents", label: "Marketers", icon: Building2 },
    { href: "/admin/transactions", label: "Transactions", icon: Coins },
  ],
} satisfies Record<
  SessionRole,
  Array<{
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
  }>
>;

export function PortalShell({ role, session, children }: PortalShellProps) {
  const pathname = usePathname();
  const navigation = navByRole[role];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 rounded-[2rem] border border-border/70 bg-slate-950 px-5 py-6 text-slate-100 shadow-2xl shadow-slate-950/10 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-[280px] lg:self-start">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-300 text-base font-bold text-slate-950">
              FT
            </div>
            <div>
              <p className="text-lg font-semibold">Fundtrust</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {role === "admin"
                  ? "Admin control"
                  : role === "agent"
                    ? "Marketer workspace"
                    : "Customer access"}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-semibold text-white">
                {getInitials(session.name)}
              </div>
              <div>
                <p className="text-sm font-semibold">{session.name}</p>
                <p className="text-xs text-slate-400">
                  {session.phone || "System access"}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-4 bg-white/10 text-white">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              {role === "admin"
                ? "Administrator"
                : role === "agent"
                  ? "Field Marketer"
                  : "Customer"}
            </Badge>
          </div>

          <nav className="mt-8 grid gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-lg"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/4 p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-semibold">
              {role === "customer" ? (
                <WalletCards className="h-4 w-4" />
              ) : (
                <ChartNoAxesCombined className="h-4 w-4" />
              )}
              {role === "customer" ? "Savings overview" : "Daily reconciliation"}
            </div>
            <p className="mt-2 leading-6 text-slate-300">
              {role === "customer"
                ? "Review your contribution balance, weekly plan, and latest deposit activity in one secure place."
                : "Keep collections current, review balances, and print reports with one secure workflow."}
            </p>
          </div>

          <div className="mt-8">
            <LogoutForm />
          </div>
        </aside>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
