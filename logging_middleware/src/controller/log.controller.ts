import {
  ALLOWED_LEVELS,
  ALLOWED_PACKAGES,
  ALLOWED_STACKS
} from "../config/logger.config";
import type { LogLevel, LogPackage, LogStack } from "../config/logger.config";
import { sendLog } from "../service/log.service";
import type { LogResult } from "../service/log.service";

function validateValue<T extends readonly string[]>(
  allowed: T,
  value: string,
  label: string
): asserts value is T[number] {
  if (!allowed.includes(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

export async function Log(
  stack: LogStack,
  level: LogLevel,
  logPackage: LogPackage,
  message: string
): Promise<LogResult> {
  validateValue(ALLOWED_STACKS, stack, "stack");
  validateValue(ALLOWED_LEVELS, level, "level");
  validateValue(ALLOWED_PACKAGES, logPackage, "package");

  return sendLog({ stack, level, logPackage, message });
}
