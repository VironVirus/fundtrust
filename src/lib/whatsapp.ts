import "server-only";

import { getEnv } from "@/lib/env";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { formatTransactionType } from "@/lib/transaction-options";

type WhatsAppDeliveryResult = {
  delivered: boolean;
  provider: "meta" | "log";
};

type WhatsAppTemplateInput = {
  phone: string;
  templateName: string;
  parameters: string[];
};

function shouldIncludeTemplateParameters(templateName: string) {
  return templateName.trim().toLowerCase() !== "hello_world";
}

function normalizePhoneForWhatsApp(phone: string) {
  const digits = String(phone ?? "").replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    return digits;
  }

  if (digits.startsWith("234")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+234${digits.slice(1)}`;
  }

  // Many locally entered Nigerian mobile numbers omit the leading 0.
  if (/^\d{10}$/.test(digits)) {
    return `+234${digits}`;
  }

  return `+${digits}`;
}

export function isWhatsAppConfigured() {
  const env = getEnv();

  return (
    env.WHATSAPP_PROVIDER === "meta" &&
    Boolean(env.WHATSAPP_ACCESS_TOKEN) &&
    Boolean(env.WHATSAPP_PHONE_NUMBER_ID) &&
    Boolean(env.WHATSAPP_TEMPLATE_REGISTRATION) &&
    Boolean(env.WHATSAPP_TEMPLATE_DEPOSIT)
  );
}

async function sendTemplateMessage(
  input: WhatsAppTemplateInput,
): Promise<WhatsAppDeliveryResult> {
  const env = getEnv();

  if (env.WHATSAPP_PROVIDER === "log") {
    console.info("Fundtrust WhatsApp preview", input);
    return {
      delivered: false,
      provider: "log",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhoneForWhatsApp(input.phone),
        type: "template",
        template: {
          name: input.templateName,
          language: {
            code: env.WHATSAPP_TEMPLATE_LANGUAGE,
          },
          components:
            shouldIncludeTemplateParameters(input.templateName) &&
            input.parameters.length
            ? [
                {
                  type: "body",
                  parameters: input.parameters.map((parameter) => ({
                    type: "text",
                    text: parameter,
                  })),
                },
              ]
            : undefined,
        },
      }),
    },
  );

  const payload = await response.text();

  if (!response.ok) {
    throw new Error(
      `WhatsApp delivery failed with status ${response.status}: ${payload}`,
    );
  }

  return {
    delivered: true,
    provider: "meta",
  };
}

export async function sendCustomerRegistrationWhatsApp(input: {
  customerName: string;
  customerId: string;
  phone: string;
  branch: string;
  contributionType: string;
}) {
  const env = getEnv();

  return sendTemplateMessage({
    phone: input.phone,
    templateName:
      env.WHATSAPP_TEMPLATE_REGISTRATION || "fundtrust_registration_notice",
    parameters: [
      input.customerName,
      input.customerId,
      input.branch,
      input.contributionType,
    ],
  });
}

export async function sendDepositWhatsApp(input: {
  customerName: string;
  phone: string;
  marketerName: string;
  amount: number;
  paymentMethod: string;
  date: string;
}) {
  const env = getEnv();

  return sendTemplateMessage({
    phone: input.phone,
    templateName:
      env.WHATSAPP_TEMPLATE_DEPOSIT || "fundtrust_deposit_notice",
    parameters: [
      input.customerName,
      input.marketerName,
      formatCurrency(input.amount),
      formatTransactionType(input.paymentMethod),
      formatDateTime(input.date),
    ],
  });
}
