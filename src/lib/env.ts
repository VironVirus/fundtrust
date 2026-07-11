import "server-only";

import { z } from "zod";

const envSchema = z
  .object({
    APP_NAME: z.string().default("Fundtrust"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    AUTH_SECRET: z.string().min(32),
    SUPABASE_URL: z
      .union([z.string().url(), z.literal(""), z.undefined()])
      .transform((value) => value || undefined),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
    SUPABASE_SCHEMA: z.string().default("public"),
    ADMIN_LOGIN: z.string().min(3),
    ADMIN_PASSWORD_HASH: z.string().min(20),
    ADMIN_EMAIL: z.string().email(),
  })
  .superRefine((value, context) => {
    if (value.SUPABASE_URL && !value.SUPABASE_SERVICE_ROLE_KEY) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
        message: "SUPABASE_SERVICE_ROLE_KEY is required when SUPABASE_URL is set.",
      });
    }

    if (value.SUPABASE_SERVICE_ROLE_KEY && !value.SUPABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SUPABASE_URL"],
        message: "SUPABASE_URL is required when SUPABASE_SERVICE_ROLE_KEY is set.",
      });
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
