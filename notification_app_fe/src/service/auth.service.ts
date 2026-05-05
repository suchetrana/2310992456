import { runtimeConfig } from "../config/runtime";

const STORAGE_KEY = "affordmed.auth.token";

type AuthPayload = {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
};

function getStoredToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function storeToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, token);
}

function getAuthPayload(): AuthPayload | null {
  const payload = {
    email: import.meta.env.VITE_AUTH_EMAIL ?? "",
    name: import.meta.env.VITE_AUTH_NAME ?? "",
    rollNo: import.meta.env.VITE_AUTH_ROLL_NO ?? "",
    accessCode: import.meta.env.VITE_AUTH_ACCESS_CODE ?? "",
    clientID: import.meta.env.VITE_AUTH_CLIENT_ID ?? "",
    clientSecret: import.meta.env.VITE_AUTH_CLIENT_SECRET ?? ""
  };

  const hasAll = Object.values(payload).every((value) => value.trim().length > 0);
  return hasAll ? payload : null;
}

export async function ensureAuthToken(): Promise<string> {
  const stored = getStoredToken();
  if (stored) {
    return stored;
  }

  if (runtimeConfig.token) {
    storeToken(runtimeConfig.token);
    return runtimeConfig.token;
  }

  const payload = getAuthPayload();
  if (!payload) {
    return "";
  }

  const url = `${runtimeConfig.apiBaseUrl.replace(/\/+$/, "")}/auth`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let parsed: unknown = null;

    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    if (!response.ok || !parsed) {
      return "";
    }

    const token = (parsed as { access_token?: string }).access_token ?? "";
    if (token) {
      storeToken(token);
    }

    return token;
  } catch {
    return "";
  }
}
