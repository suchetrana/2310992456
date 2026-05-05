import { runtimeConfig } from "../config/runtime";
import { safeLog } from "../utils/safe-log";

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
};

export type NotificationQuery = {
  limit: number;
  page: number;
  type?: string;
};

export type NotificationPage = {
  ok: boolean;
  items: NotificationItem[];
  hasNext: boolean;
  error?: string;
};

function buildQuery(params: NotificationQuery): string {
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  search.set("page", String(params.page));
  if (params.type && params.type !== "All") {
    search.set("notification_type", params.type);
  }
  return search.toString();
}

export async function fetchNotifications(
  params: NotificationQuery
): Promise<NotificationPage> {
  if (!runtimeConfig.token) {
    return { ok: false, items: [], hasNext: false, error: "Missing token" };
  }

  const url = `${runtimeConfig.apiBaseUrl.replace(/\/+$/, "")}/notifications?${buildQuery(params)}`;

  void safeLog("frontend", "info", "api", "fetch notifications");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${runtimeConfig.token}`
      }
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

    if (!response.ok) {
      void safeLog("frontend", "error", "api", "notification fetch failed");
      return { ok: false, items: [], hasNext: false, error: "Fetch failed" };
    }

    const items = Array.isArray((parsed as { notifications?: unknown }).notifications)
      ? ((parsed as { notifications: Array<{ ID: string; Type: string; Message: string; Timestamp: string }> }).notifications ?? [])
      : [];

    const mapped = items.map((item) => ({
      id: item.ID,
      type: item.Type,
      message: item.Message,
      timestamp: item.Timestamp
    }));

    return {
      ok: true,
      items: mapped,
      hasNext: mapped.length >= params.limit
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    void safeLog("frontend", "error", "api", message);
    return { ok: false, items: [], hasNext: false, error: message };
  }
}
