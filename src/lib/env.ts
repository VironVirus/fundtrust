import "server-only";

import { z } from "zod";

const envSchema = z
  .object({
    APP_NAME: z.string().default("Fundtrust"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    AUTH_SECRET: z.string().min(32),
    APPS_SCRIPT_WEB_APP_URL: z
      .union([z.string().url(), z.literal(""), z.undefined()])
      .transform((value) => value || undefined),
    APPS_SCRIPT_SHARED_SECRET: z.string().optional().default(""),
    ADMIN_LOGIN: z.string().min(3),
    ADMIN_PASSWORD_HASH: z.string().min(20),
    ADMIN_EMAIL: z.string().email(),
    EMAIL_PROVIDER: z.enum(["smtp", "resend", "log"]).default("log"),
    WHATSAPP_PROVIDER: z.enum(["meta", "log"]).default("log"),
    WHATSAPP_API_VERSION: z.string().default("v23.0"),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_BUSINESS_PHONE: z.string().optional(),
    WHATSAPP_TEMPLATE_LANGUAGE: z.string().default("en"),
    WHATSAPP_TEMPLATE_REGISTRATION: z.string().optional(),
    WHATSAPP_TEMPLATE_DEPOSIT: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .union([z.literal("true"), z.literal("false"), z.undefined()])
      .transform((value) => value === "true"),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.EMAIL_PROVIDER === "smtp") {
      for (const field of ["SMTP_HOST", "SMTP_FROM"]) {
        if (!value[field as keyof typeof value]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when EMAIL_PROVIDER=smtp.`,
          });
        }
      }
    }

    if (value.EMAIL_PROVIDER === "resend") {
      for (const field of ["RESEND_API_KEY", "RESEND_FROM"]) {
        if (!value[field as keyof typeof value]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when EMAIL_PROVIDER=resend.`,
          });
        }
      }
    }

    if (value.WHATSAPP_PROVIDER === "meta") {
      for (const field of [
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_TEMPLATE_REGISTRATION",
        "WHATSAPP_TEMPLATE_DEPOSIT",
      ]) {
        if (!value[field as keyof typeof value]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when WHATSAPP_PROVIDER=meta.`,
          });
        }
      }
    }
  });

type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}
