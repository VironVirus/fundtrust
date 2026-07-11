import Link from "next/link";
import { Download, Search, Users } from "lucide-react";

import { CustomerEditForm } from "@/components/forms/customer-edit-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  customerBranchOptions,
  customerContributionTypeOptions,
} from "@/lib/customer-options";
import { filterCustomers } from "@/lib/customer-filters";
import { getCustomerStatus } from "@/lib/customer-status";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCustomers } from "@/lib/sheets";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
    sex?: string;
    status?: string;
    branch?: string;
    contributionType?: string;
    customerId?: string;
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sex = params.sex ?? "";
  const status = params.status ?? "";
  const branch = params.branch ?? "";
  const contributionType = params.contributionType ?? "";
  const customers = await getCustomers();
  const filteredCustomers = filterCustomers(customers, {
    q: query,
    sex,
    status,
    branch,
    contributionType,
  });
  const selectedCustomer =
    customers.find((customer) => customer.id === params.customerId) ||
    filteredCustomers[0] ||
    null;
  const exportParams = new URLSearchParams();

  if (query) exportParams.set("q", query);
  if (sex) exportParams.set("sex", sex);
  if (status) exportParams.set("status", status);
  if (branch) exportParams.set("branch", branch);
  if (contributionType) {
    exportParams.set("contributionType", contributionType);
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border/70 bg-white/86 p-6 shadow-xl shadow-slate-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Customer ledger
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Customers
        </h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">View and edit customer records.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 xl:grid-cols-[1fr_160px_180px_200px_200px_auto_auto] xl:items-end">
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  name="q"
                  placeholder="Customer ID, name, phone, email, branch, or plan"
                  defaultValue={query}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select id="sex" name="sex" defaultValue={sex}>
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={status}>
                <option value="">All statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select id="branch" name="branch" defaultValue={branch}>
                <option value="">All branches</option>
                {customerBranchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contributionType">Plan type</Label>
              <Select
                id="contributionType"
                name="contributionType"
                defaultValue={contributionType}
              >
                <option value="">All plan types</option>
                {customerContributionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Apply filters</Button>
            <Button asChild variant="outline">
              <Link href="/admin/customers">Reset</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                  {filteredCustomers.length.toLocaleString("en-NG")} records
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link
                  href={`/api/admin/customers/export${
                    exportParams.toString() ? `?${exportParams.toString()}` : ""
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Plan type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const rowParams = new URLSearchParams();
                    if (query) rowParams.set("q", query);
                    if (sex) rowParams.set("sex", sex);
                    if (status) rowParams.set("status", status);
                    if (branch) rowParams.set("branch", branch);
                    if (contributionType) {
                      rowParams.set("contributionType", contributionType);
                    }
                    rowParams.set("customerId", customer.id);

                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-primary">
                          {customer.id}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/customers?${rowParams.toString()}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {customer.name}
                          </Link>
                        </TableCell>
                        <TableCell>{customer.branch || "Not set"}</TableCell>
                        <TableCell>
                          {customer.contributionType || "Not set"}
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{getCustomerStatus(customer)}</TableCell>
                        <TableCell>{formatCurrency(customer.totalAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No customers found"
                description="Try a different search."
                icon={Users}
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedCustomer ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCustomer.name}</CardTitle>
                  <CardDescription>Customer details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant={
                        getCustomerStatus(selectedCustomer) === "Active"
                          ? "default"
                          : "success"
                      }
                    >
                      {getCustomerStatus(selectedCustomer)}
                    </Badge>
                    <Badge variant="outline">
                      Customer ID {selectedCustomer.id}
                    </Badge>
                    <span className="text-muted-foreground">
                      Joined {formatDate(selectedCustomer.dateJoined)}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Address
                      </p>
                      <p className="mt-2 text-foreground">
                        {selectedCustomer.address}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Contact
                      </p>
                      <p className="mt-2 text-foreground">
                        {selectedCustomer.phone}
                      </p>
                      <p className="text-foreground">{selectedCustomer.email}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Demographics
                      </p>
                      <p className="mt-2 text-foreground">
                        {selectedCustomer.sex} • {selectedCustomer.age} years
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Branch and plan
                      </p>
                      <p className="mt-2 text-foreground">
                        Branch: {selectedCustomer.branch || "Not set"}
                      </p>
                      <p className="text-foreground">
                        Plan: {selectedCustomer.contributionType || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Contribution summary
                      </p>
                      <p className="mt-2 text-foreground">
                        Total saved: {formatCurrency(selectedCustomer.totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Edit customer</CardTitle>
                  <CardDescription>Update profile and balance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomerEditForm
                    key={selectedCustomer.id}
                    customer={selectedCustomer}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <EmptyState
              title="Select a customer"
              description="Choose a customer from the table."
              icon={Users}
            />
          )}
        </div>
      </section>
    </main>
  );
}
