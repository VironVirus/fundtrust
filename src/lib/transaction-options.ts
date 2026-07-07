export const transactionTypeValues = ["cash", "transfer"] as const;

export type TransactionPaymentMethod = (typeof transactionTypeValues)[number];

export const transactionTypeOptions = [
  { label: "Cash", value: "cash" },
  { label: "Bank transfer", value: "transfer" },
] as const satisfies Array<{
  label: string;
  value: TransactionPaymentMethod;
}>;

export function normalizeTransactionType(
  value: unknown,
): TransactionPaymentMethod {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized === "transfer" ||
    normalized === "bank transfer" ||
    normalized === "bank-transfer"
  ) {
    return "transfer";
  }

  return "cash";
}

export function formatTransactionType(
  value: TransactionPaymentMethod | string,
) {
  return normalizeTransactionType(value) === "transfer"
    ? "Bank transfer"
    : "Cash";
}
