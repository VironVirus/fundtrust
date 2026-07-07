import { z } from "zod";

import {
  customerBranchValues,
  customerContributionTypeValues,
} from "@/lib/customer-options";
import { transactionTypeValues } from "@/lib/transaction-options";

const amountSchema = z.coerce.number().min(0, "Amount cannot be negative.");

function addSavingsValidation<T extends z.ZodObject<z.core.$ZodLooseShape>>(
  schema: T,
) {
  return schema.superRefine((values, context) => {
    const savingsTarget = Number(values.savingsTarget ?? 0);
    const savingsDuration = Number(values.savingsDuration ?? 0);
    const weeklyPayment = Number(values.weeklyPayment ?? 0);
    const balanceToComplete = Number(values.balanceToComplete ?? 0);
    const totalAmount = Number(values.totalAmount ?? 0);

    if (savingsTarget <= 0 || savingsDuration <= 0) {
      return;
    }

    const derivedWeeklyPayment = savingsTarget / savingsDuration;
    const totalTrackedAmount = balanceToComplete + totalAmount;

    if (Math.abs(derivedWeeklyPayment - weeklyPayment) > 0.01) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weeklyPayment"],
        message:
          "Weekly payment must match savings target divided by savings duration.",
      });
    }

    if (Math.abs(totalTrackedAmount - savingsTarget) > 0.01) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["balanceToComplete"],
        message: "Balance left plus total saved must equal the savings target.",
      });
    }
  });
}

export const agentRegistrationSchema = z
  .object({
    name: z.string().min(3, "Enter the marketer's full name."),
    phone: z.string().min(7, "Enter a valid phone number."),
    address: z.string().min(8, "Enter a complete address."),
    branch: z.enum(customerBranchValues, {
      message: "Select the marketer's branch.",
    }),
    gender: z.enum(["Male", "Female", "Other"], {
      message: "Select a gender.",
    }),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const agentLoginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number."),
  password: z.string().min(1, "Enter your password."),
});

export const adminLoginSchema = z.object({
  login: z.string().min(1, "Enter your admin login."),
  password: z.string().min(1, "Enter your password."),
});

export const customerLoginSchema = z.object({
  phone: z.string().min(7, "Enter a valid phone number."),
  email: z.string().email("Enter a valid email address."),
  branch: z.enum(customerBranchValues, {
    message: "Select your closest branch.",
  }),
  contributionType: z.enum(customerContributionTypeValues, {
    message: "Select the plan attached to your profile.",
  }),
});

export const depositSchema = z.object({
  customerId: z.string().min(1, "Select a customer."),
  amount: z.coerce
    .number()
    .positive("Deposit amount must be greater than zero."),
  paymentMethod: z.enum(transactionTypeValues, {
    message: "Select whether the customer paid with cash or transfer.",
  }),
});

export const customerRegistrationSchema = addSavingsValidation(
  z.object({
    name: z.string().min(3, "Enter the customer's full name."),
    address: z.string().min(8, "Enter a complete address."),
    sex: z.enum(["Male", "Female", "Other"], {
      message: "Select the customer's sex.",
    }),
    age: z.coerce.number().int().min(0).max(120),
    phone: z.string().min(7, "Enter a valid phone number."),
    email: z.string().email("Enter a valid email address."),
    branch: z.enum(customerBranchValues, {
      message: "Select the customer's closest branch.",
    }),
    contributionType: z.enum(customerContributionTypeValues, {
      message: "Select the customer's plan type.",
    }),
    savingsTarget: amountSchema,
    savingsDuration: z.coerce
      .number()
      .int("Savings duration must be a whole number of weeks.")
      .min(0, "Savings duration cannot be negative."),
    weeklyPayment: amountSchema,
    balanceToComplete: amountSchema,
    totalAmount: amountSchema,
    dateJoined: z.string().min(1, "Enter the joining date."),
  }),
);

export const customerUpdateSchema = addSavingsValidation(
  z.object({
    id: z.string().min(1),
    dateJoined: z.string().min(1),
    name: z.string().min(3, "Enter the customer's full name."),
    address: z.string().min(8, "Enter a complete address."),
    sex: z.enum(["Male", "Female", "Other"], {
      message: "Select the customer's sex.",
    }),
    age: z.coerce.number().int().min(0).max(120),
    phone: z.string().min(7, "Enter a valid phone number."),
    email: z.string().email("Enter a valid email address."),
    savingsTarget: amountSchema,
    savingsDuration: z.coerce
      .number()
      .int("Savings duration must be a whole number of weeks.")
      .min(0, "Savings duration cannot be negative."),
    weeklyPayment: amountSchema,
    balanceToComplete: amountSchema,
    totalAmount: amountSchema,
  }),
);

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(7, "Enter a valid phone number."),
  message: z.string().min(10, "Tell us how we can help."),
});
