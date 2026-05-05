const STACKS = ["backend", "frontend"] as const;
const LEVELS = ["debug", "info", "warn", "error", "fatal"] as const;
const PACKAGES = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils"
] as const;

export type LogStack = (typeof STACKS)[number];
export type LogLevel = (typeof LEVELS)[number];
export type LogPackage = (typeof PACKAGES)[number];

export type LoggerConfig = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
};

export const ALLOWED_STACKS = STACKS;
export const ALLOWED_LEVELS = LEVELS;
export const ALLOWED_PACKAGES = PACKAGES;

let loggerConfig: LoggerConfig | null = null;

export function configureLogger(config: LoggerConfig): void {
  if (!config.baseUrl) {
    throw new Error("Logger baseUrl is required");
  }
  if (!config.token) {
    throw new Error("Logger token is required");
  }
  loggerConfig = {
    ...config,
    baseUrl: config.baseUrl.replace(/\/+$/, "")
  };
}

export function getLoggerConfig(): LoggerConfig {
  if (!loggerConfig) {
    throw new Error("Logger is not configured");
  }
  return loggerConfig;
}
