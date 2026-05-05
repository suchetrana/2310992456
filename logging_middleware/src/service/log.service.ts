import { getLoggerConfig } from "../config/logger.config";
import type { LogLevel, LogPackage, LogStack } from "../config/logger.config";

export type LogResult =
  | { ok: true; status: number; logId: string | null; raw: unknown }
  | { ok: false; status: number; error: string; raw?: unknown };

type LogPayload = {
  stack: LogStack;
  level: LogLevel;
  logPackage: LogPackage;
  message: string;
};

function extractLogId(raw: unknown): string | null {
  if (raw && typeof raw === "object" && "logID" in raw) {
    const candidate = (raw as { logID?: unknown }).logID;
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

export async function sendLog(payload: LogPayload): Promise<LogResult> {
  if (typeof fetch !== "function") {
    return { ok: false, status: 0, error: "fetch is not available" };
  }

  const config = getLoggerConfig();
  const controller = new AbortController();
  const timeoutMs = config.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`
      },
      body: JSON.stringify({
        stack: payload.stack,
        level: payload.level,
        package: payload.logPackage,
        message: payload.message
      }),
      signal: controller.signal
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: "Log request failed",
        raw: parsed
      };
    }

    return {
      ok: true,
      status: response.status,
      logId: extractLogId(parsed),
      raw: parsed
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, status: 0, error: messageText };
  } finally {
    clearTimeout(timeoutId);
  }
}
