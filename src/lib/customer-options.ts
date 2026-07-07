export const customerBranchValues = [
  "Onitsha",
  "Enugu",
  "Aba",
  "Nsukka",
] as const;

export type CustomerBranch = (typeof customerBranchValues)[number];

export const customerContributionTypeValues = [
  "Daily contribution",
  "Loan",
  "Property purchase",
] as const;

export type CustomerContributionType =
  (typeof customerContributionTypeValues)[number];

export const customerBranchOptions = [
  { value: "Onitsha", label: "Onitsha", code: "01" },
  { value: "Enugu", label: "Enugu", code: "02" },
  { value: "Aba", label: "Aba", code: "03" },
  { value: "Nsukka", label: "Nsukka", code: "04" },
] as const satisfies ReadonlyArray<{
  value: CustomerBranch;
  label: string;
  code: string;
}>;

export const customerContributionTypeOptions = [
  { value: "Daily contribution", label: "Daily contribution", code: "01" },
  { value: "Loan", label: "Loan", code: "02" },
  { value: "Property purchase", label: "Property purchase", code: "03" },
] as const satisfies ReadonlyArray<{
  value: CustomerContributionType;
  label: string;
  code: string;
}>;

export function isCustomerBranch(value: string): value is CustomerBranch {
  return customerBranchValues.includes(value as CustomerBranch);
}

export function isCustomerContributionType(
  value: string,
): value is CustomerContributionType {
  return customerContributionTypeValues.includes(
    value as CustomerContributionType,
  );
}

export function normalizeCustomerBranch(value: unknown): CustomerBranch | "" {
  const branch = String(value ?? "").trim();
  return isCustomerBranch(branch) ? branch : "";
}

export function normalizeCustomerContributionType(
  value: unknown,
): CustomerContributionType | "" {
  const contributionType = String(value ?? "").trim();
  return isCustomerContributionType(contributionType) ? contributionType : "";
}

export function getCustomerBranchCode(branch: string) {
  return customerBranchOptions.find((option) => option.value === branch)?.code ?? "";
}

export function getCustomerContributionTypeCode(contributionType: string) {
  return (
    customerContributionTypeOptions.find(
      (option) => option.value === contributionType,
    )?.code ?? ""
  );
}

export function getCustomerIdPreview(
  branch: string,
  contributionType: string,
  serial = "0001",
) {
  const branchCode = getCustomerBranchCode(branch);
  const contributionTypeCode = getCustomerContributionTypeCode(
    contributionType,
  );

  if (!branchCode || !contributionTypeCode) {
    return "";
  }

  return `${branchCode}${contributionTypeCode}${serial}`;
}
