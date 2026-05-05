import { getTestApiConfig } from "../config/test-api.config";
import { safeLog } from "../utils/safe-log";

export type NotificationRecord = {
  ID: string;
  Type: "Event" | "Result" | "Placement" | string;
  Message: string;
  Timestamp: string;
};

export type NotificationQuery = {
  limit?: number;
  page?: number;
  notification_type?: string;
};

export type NotificationApiResult =
  | { ok: true; status: number; notifications: NotificationRecord[] }
  | { ok: false; status: number; error: string };

let lastNotifications: NotificationRecord[] = [];

export function getLastNotifications(): NotificationRecord[] {
  return [...lastNotifications];
}

function setLastNotifications(list: NotificationRecord[]): void {
  lastNotifications = [...list];
}

function buildQuery(params: NotificationQuery): string {
  const search = new URLSearchParams();
  if (params.limit) {
    search.set("limit", String(params.limit));
  }
  if (params.page) {
    search.set("page", String(params.page));
  }
  if (params.notification_type) {
    search.set("notification_type", params.notification_type);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchNotifications(
  params: NotificationQuery
): Promise<NotificationApiResult> {
  const { baseUrl, token } = getTestApiConfig();

  if (!token) {
    return { ok: false, status: 401, error: "Missing auth token" };
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/notifications${buildQuery(params)}`;
  void safeLog("backend", "info", "service", "fetch notifications");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
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
      void safeLog("backend", "error", "service", "notification fetch failed");
      return { ok: false, status: response.status, error: "Fetch failed" };
    }

    const notifications = Array.isArray((parsed as { notifications?: unknown }).notifications)
      ? ((parsed as { notifications: NotificationRecord[] }).notifications ?? [])
      : [];

    setLastNotifications(notifications);

    return { ok: true, status: response.status, notifications };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    void safeLog("backend", "error", "service", message);
    return { ok: false, status: 0, error: message };
  }
}
