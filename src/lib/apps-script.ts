import "server-only";

import { getEnv } from "@/lib/env";

type AppsScriptSuccessResponse<T> = {
  ok: true;
  data: T;
};

type AppsScriptErrorResponse = {
  ok: false;
  error: string;
};

type AppsScriptResponse<T> =
  | AppsScriptSuccessResponse<T>
  | AppsScriptErrorResponse;

export function isAppsScriptConfigured() {
  return Boolean(process.env.APPS_SCRIPT_WEB_APP_URL);
}

function getAppsScriptUrl() {
  const url = getEnv().APPS_SCRIPT_WEB_APP_URL;

  if (!url) {
    throw new Error(
      "Apps Script backend is not configured yet. Add APPS_SCRIPT_WEB_APP_URL to .env.local.",
    );
  }

  return url;
}

function parseAppsScriptResponse<T>(text: string) {
  try {
    return JSON.parse(text) as AppsScriptResponse<T>;
  } catch {
    throw new Error(
      "Apps Script returned a non-JSON response. Confirm the web app URL is correct and the deployment access is set to Anyone.",
    );
  }
}

export async function callAppsScript<T>(
  action: string,
  payload?: Record<string, unknown>,
): Promise<T> {
  const env = getEnv();
  let response: Response;

  try {
    response = await fetch(getAppsScriptUrl(), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        action,
        token: env.APPS_SCRIPT_SHARED_SECRET,
        ...payload,
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        "The Apps Script backend took too long to respond. Please try again.",
      );
    }

    throw error;
  }

  const text = await response.text();
  const parsed = parseAppsScriptResponse<T>(text);

  if (!response.ok) {
    throw new Error(
      `Apps Script request failed with status ${response.status}.`,
    );
  }

  if (!parsed.ok) {
    throw new Error(parsed.error || "Apps Script could not complete the request.");
  }

  return parsed.data;
}
