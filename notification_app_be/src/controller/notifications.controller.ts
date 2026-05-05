import type { Request, Response } from "express";
import {
  fetchNotifications,
  getLastNotifications,
  type NotificationRecord
} from "../service/notifications.service";
import {
  getLastSeenIds,
  getUnreadCount,
  isRead,
  markAll,
  markRead,
  setLastSeenIds
} from "../utils/read-state";
import { safeLog } from "../utils/safe-log";

function mapNotification(notification: NotificationRecord) {
  return {
    id: notification.ID,
    type: notification.Type,
    message: notification.Message,
    timestamp: notification.Timestamp,
    isRead: isRead(notification.ID)
  };
}

export async function listNotifications(
  req: Request,
  res: Response
): Promise<void> {
  const rawLimit = Number(req.query.limit ?? "20");
  const rawPage = Number(req.query.page ?? "1");
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20;
  const page = Number.isFinite(rawPage) ? rawPage : 1;
  const notification_type = typeof req.query.notification_type === "string"
    ? req.query.notification_type
    : undefined;

  const result = await fetchNotifications({ limit, page, notification_type });
  if (!result.ok) {
    res.status(502).json({ message: "Failed to fetch notifications" });
    return;
  }

  const ids = result.notifications.map((item) => item.ID);
  setLastSeenIds(ids);

  const items = result.notifications.map(mapNotification);
  const hasNext = items.length >= limit;

  void safeLog("backend", "info", "controller", "notifications listed");
  res.status(200).json({
    items,
    page,
    limit,
    hasNext
  });
}

export async function unreadCount(
  _req: Request,
  res: Response
): Promise<void> {
  const result = await fetchNotifications({ limit: 100, page: 1 });
  if (!result.ok) {
    res.status(502).json({ message: "Failed to fetch notifications" });
    return;
  }

  const ids = result.notifications.map((item) => item.ID);
  const count = getUnreadCount(ids);

  void safeLog("backend", "info", "controller", "unread count fetched");
  res.status(200).json({ count });
}

export async function markNotificationRead(
  req: Request,
  res: Response
): Promise<void> {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ message: "Missing id" });
    return;
  }

  markRead(id);
  void safeLog("backend", "info", "controller", "notification marked read");
  res.status(200).json({ id, isRead: true, readAt: new Date().toISOString() });
}

export async function markAllRead(
  _req: Request,
  res: Response
): Promise<void> {
  const lastIds = getLastSeenIds();
  let updatedIds = lastIds;
  if (lastIds.length === 0) {
    const fallback = getLastNotifications().map((item) => item.ID);
    markAll(fallback);
    updatedIds = fallback;
  } else {
    markAll(lastIds);
  }

  void safeLog("backend", "info", "controller", "all notifications marked read");
  res.status(200).json({ updated: updatedIds.length, readAt: new Date().toISOString() });
}

export async function streamNotifications(
  req: Request,
  res: Response
): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("event: connected\n");
  res.write(`data: {"status":"ok"}\n\n`);

  const seen = new Set<string>();
  let active = true;

  const interval = setInterval(async () => {
    if (!active) {
      return;
    }

    const result = await fetchNotifications({ limit: 50, page: 1 });
    if (!result.ok) {
      void safeLog("backend", "warn", "controller", "stream fetch failed");
      return;
    }

    for (const notification of result.notifications) {
      if (seen.has(notification.ID)) {
        continue;
      }
      seen.add(notification.ID);
      res.write("event: notification.new\n");
      res.write(`data: ${JSON.stringify(mapNotification(notification))}\n\n`);
    }
  }, 15000);

  req.on("close", () => {
    active = false;
    clearInterval(interval);
    res.end();
  });
}
