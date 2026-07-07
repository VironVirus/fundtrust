import { getCustomerStatus } from "@/lib/customer-status";
import type { Customer } from "@/lib/types";
import { matchesSearch } from "@/lib/utils";

export type CustomerFilters = {
  q?: string;
  sex?: string;
  status?: string;
  branch?: string;
  contributionType?: string;
};

export function filterCustomers(customers: Customer[], filters: CustomerFilters) {
  const query = filters.q?.trim() ?? "";
  const sex = filters.sex ?? "";
  const status = filters.status ?? "";
  const branch = filters.branch ?? "";
  const contributionType = filters.contributionType ?? "";

  return customers.filter((customer) => {
    const matchesQuery =
      !query ||
      matchesSearch(customer.id, query) ||
      matchesSearch(customer.name, query) ||
      matchesSearch(customer.phone, query) ||
      matchesSearch(customer.email, query) ||
      matchesSearch(customer.branch, query) ||
      matchesSearch(customer.contributionType, query);
    const matchesSex = !sex || customer.sex === sex;
    const matchesStatus = !status || getCustomerStatus(customer) === status;
    const matchesBranch = !branch || customer.branch === branch;
    const matchesContributionType =
      !contributionType || customer.contributionType === contributionType;

    return (
      matchesQuery &&
      matchesSex &&
      matchesStatus &&
      matchesBranch &&
      matchesContributionType
    );
  });
}
