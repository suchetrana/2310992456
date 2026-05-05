import { Log } from "logging-middleware";
import type { LogLevel, LogPackage, LogStack } from "logging-middleware";
import { isLoggerEnabled } from "../config/logger.config";

export async function safeLog(
  stack: LogStack,
  level: LogLevel,
  logPackage: LogPackage,
  message: string
): Promise<void> {
  if (!isLoggerEnabled()) {
    return;
  }

  try {
    await Log(stack, level, logPackage, message);
  } catch {
    return;
  }
}
