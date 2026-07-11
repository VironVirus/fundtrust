import "server-only";

import { getEnv } from "@/lib/env";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { queueNotificationEvent } from "@/lib/supabase";
import {
  formatTransactionType,
  type TransactionPaymentMethod,
} from "@/lib/transaction-options";

type EmailPayload = {
  eventType: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  payload?: Record<string, unknown>;
};

type DepositEmailInput = {
  customerName: string;
  customerEmail: string;
  amount: number;
  agentName: string;
  paymentMethod: TransactionPaymentMethod;
  date: string;
};

type WelcomeEmailInput = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  branch: string;
  contributionType: string;
  dateJoined: string;
};

export type EmailDeliveryResult = {
  delivered: boolean;
  provider: "supabase" | "log";
};

async function sendEmail(payload: EmailPayload): Promise<EmailDeliveryResult> {
  const queued = await queueNotificationEvent({
    eventType: payload.eventType,
    toEmail: payload.to,
    subject: payload.subject,
    textBody: payload.text,
    htmlBody: payload.html,
    payload: payload.payload,
  });

  return {
    delivered: queued,
    provider: queued ? "supabase" : "log",
  };
}

export async function sendDepositConfirmationEmail(input: DepositEmailInput) {
  const paymentMethodLabel = formatTransactionType(input.paymentMethod);
  const subject = `Fundtrust deposit confirmation for ${input.customerName}`;
  const text = `Hello ${input.customerName},

We have recorded your Fundtrust deposit of ${formatCurrency(input.amount)}.
Handled by marketer: ${input.agentName}
Payment method: ${paymentMethodLabel}
Date: ${formatDateTime(input.date)}

Thank you for saving with Fundtrust.`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f8f6; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; border: 1px solid rgba(16, 32, 50, 0.08);">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #10634d; font-weight: 700;">Fundtrust receipt</p>
        <h1 style="margin: 0 0 16px; font-size: 28px; color: #102032;">Deposit confirmed</h1>
        <p style="margin: 0 0 24px; color: #4f6375; line-height: 1.7;">
          Hello ${input.customerName}, your contribution has been recorded successfully.
        </p>
        <div style="border-radius: 18px; background: #eff8f4; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #4f6375;">Amount received</p>
          <p style="margin: 0; font-size: 32px; font-weight: 700; color: #10634d;">${formatCurrency(input.amount)}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Handled by marketer</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${input.agentName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Payment method</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${paymentMethodLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Date</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${formatDateTime(input.date)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return sendEmail({
    eventType: "deposit_receipt",
    to: input.customerEmail,
    subject,
    text,
    html,
    payload: input,
  });
}

export async function sendCustomerWelcomeEmail(input: WelcomeEmailInput) {
  const subject = `Welcome to Fundtrust, ${input.customerName}`;
  const text = `Hello ${input.customerName},

Your Fundtrust customer profile has been created successfully.
Customer ID: ${input.customerId}
Closest branch: ${input.branch}
Plan type: ${input.contributionType}
Date joined: ${formatDateTime(input.dateJoined)}

Keep your customer ID safe. Marketers can use it to locate your account for deposits and you can use it to track your savings progress.

Thank you for choosing Fundtrust.`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f8f6; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; border: 1px solid rgba(16, 32, 50, 0.08);">
        <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #10634d; font-weight: 700;">Fundtrust welcome</p>
        <h1 style="margin: 0 0 16px; font-size: 28px; color: #102032;">Your customer profile is ready</h1>
        <p style="margin: 0 0 24px; color: #4f6375; line-height: 1.7;">
          Hello ${input.customerName}, your savings profile has been created successfully.
        </p>
        <div style="border-radius: 18px; background: #eff8f4; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px; color: #4f6375;">Customer ID</p>
          <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 0.08em; color: #10634d;">${input.customerId}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Closest branch</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${input.branch}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Plan type</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${input.contributionType}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #4f6375;">Date joined</td>
            <td style="padding: 10px 0; text-align: right; color: #102032; font-weight: 600;">${formatDateTime(input.dateJoined)}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return sendEmail({
    eventType: "customer_welcome",
    to: input.customerEmail,
    subject,
    text,
    html,
    payload: input,
  });
}

export async function sendContactNotification(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const subject = `New Fundtrust contact message from ${input.name}`;
  const text = `${input.name} sent a new contact message.

Email: ${input.email}
Phone: ${input.phone}

${input.message}`;

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f4f8f6; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px;">
        <h1 style="margin: 0 0 16px; font-size: 24px; color: #102032;">New contact message</h1>
        <p style="margin: 0 0 8px;"><strong>Name:</strong> ${input.name}</p>
        <p style="margin: 0 0 8px;"><strong>Email:</strong> ${input.email}</p>
        <p style="margin: 0 0 24px;"><strong>Phone:</strong> ${input.phone}</p>
        <p style="margin: 0; color: #4f6375; line-height: 1.7;">${input.message}</p>
      </div>
    </div>
  `;

  return sendEmail({
    eventType: "contact_message",
    to: getEnv().ADMIN_EMAIL,
    subject,
    text,
    html,
    payload: input,
  });
}
