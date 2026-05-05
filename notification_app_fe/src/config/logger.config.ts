import { configureLogger } from "logging-middleware";
import type { LoggerConfig } from "logging-middleware";

let loggerEnabled = false;

export function tryInitLogger(config: LoggerConfig): void {
  if (!config.baseUrl || !config.token) {
    return;
  }

  configureLogger(config);
  loggerEnabled = true;
}

export function isLoggerEnabled(): boolean {
  return loggerEnabled;
}
