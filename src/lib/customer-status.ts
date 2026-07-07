import type { Customer } from "@/lib/types";

export function getCustomerStatus(customer: Customer) {
  void customer;
  return "Active";
}

export function isCustomerCompleted(customer: Customer) {
  void customer;
  return false;
}
