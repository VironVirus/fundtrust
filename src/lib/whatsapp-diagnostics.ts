import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

function getLogPath() {
  return join(process.cwd(), "logs", "whatsapp-debug.log");
}

export async function logWhatsAppDiagnostic(
  scope: "registration" | "deposit",
  payload: Record<string, unknown>,
  error: unknown,
) {
  try {
    await mkdir(join(process.cwd(), "logs"), { recursive: true });

    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");

    const line = JSON.stringify({
      at: new Date().toISOString(),
      scope,
      payload,
      error: message,
    });

    await appendFile(getLogPath(), `${line}\n`, "utf8");
  } catch {
    // Diagnostics should never break the main request flow.
  }
}
