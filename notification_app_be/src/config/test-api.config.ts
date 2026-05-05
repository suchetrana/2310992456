import { loadPersonalConfig } from "./personal.config";

export type TestApiConfig = {
  baseUrl: string;
  token: string;
};

let cached: TestApiConfig | null = null;

export function getTestApiConfig(): TestApiConfig {
  if (cached) {
    return cached;
  }

  const config = loadPersonalConfig();
  cached = {
    baseUrl: config.apiBaseUrl,
    token: config.token
  };

  return cached;
}
