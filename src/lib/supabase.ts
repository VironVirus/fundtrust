import "server-only";

import { getEnv } from "@/lib/env";

type NotificationEvent = {
  eventType: string;
  toEmail: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  payload?: Record<string, unknown>;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getRestBaseUrl() {
  const env = getEnv();

  if (!env.SUPABASE_URL) {
    throw new Error(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
    );
  }

  return `${trimTrailingSlash(env.SUPABASE_URL)}/rest/v1`;
}

function getFunctionsBaseUrl() {
  const env = getEnv();

  if (!env.SUPABASE_URL) {
    throw new Error(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
    );
  }

  return `${trimTrailingSlash(env.SUPABASE_URL)}/functions/v1`;
}

function getSupabaseHeaders(prefer?: string) {
  const env = getEnv();

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.",
    );
  }

  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Profile": env.SUPABASE_SCHEMA,
    "Content-Profile": env.SUPABASE_SCHEMA,
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function parseSupabaseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!response.ok) {
    let message = text || `Supabase request failed with status ${response.status}.`;

    try {
      const payload = JSON.parse(text) as { message?: string; error?: string };
      message =
        payload.message ||
        payload.error ||
        `Supabase request failed with status ${response.status}.`;
    } catch {}

    throw new Error(message);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function supabaseSelect<T>(
  table: string,
  searchParams?: URLSearchParams,
) {
  const params = searchParams ? `?${searchParams.toString()}` : "";
  const response = await fetch(`${getRestBaseUrl()}/${table}${params}`, {
    method: "GET",
    headers: getSupabaseHeaders(),
    cache: "no-store",
  });

  return parseSupabaseResponse<T[]>(response);
}

export async function supabaseInsert<T>(
  table: string,
  payload: Record<string, unknown> | Array<Record<string, unknown>>,
) {
  const response = await fetch(`${getRestBaseUrl()}/${table}`, {
    method: "POST",
    headers: getSupabaseHeaders("return=representation"),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return parseSupabaseResponse<T[]>(response);
}

export async function supabaseUpdate<T>(
  table: string,
  payload: Record<string, unknown>,
  searchParams: URLSearchParams,
) {
  const response = await fetch(
    `${getRestBaseUrl()}/${table}?${searchParams.toString()}`,
    {
      method: "PATCH",
      headers: getSupabaseHeaders("return=representation"),
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  return parseSupabaseResponse<T[]>(response);
}

export async function supabaseRpc<T>(
  fn: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${getRestBaseUrl()}/rpc/${fn}`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return parseSupabaseResponse<T>(response);
}

export async function invokeSupabaseFunction<T>(
  fn: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${getFunctionsBaseUrl()}/${fn}`, {
    method: "POST",
    headers: getSupabaseHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return parseSupabaseResponse<T>(response);
}

export async function queueNotificationEvent(event: NotificationEvent) {
  if (!isSupabaseConfigured()) {
    console.info("Fundtrust notification preview", event);
    return false;
  }

  await supabaseInsert("notification_events", {
    event_type: event.eventType,
    to_email: event.toEmail,
    subject: event.subject,
    text_body: event.textBody,
    html_body: event.htmlBody,
    payload: event.payload ?? {},
    status: "pending",
  });

  try {
    await invokeSupabaseFunction("process-notification-events", {
      limit: 10,
    });
  } catch (error) {
    console.error("Fundtrust notification processor invoke failed", error);
  }

  return true;
}
