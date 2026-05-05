import type { NotificationItem } from "./notifications.service";

export type RankedNotification = NotificationItem & {
  score: number;
};

function typeWeight(type: string): number {
  if (type === "Placement") {
    return 3;
  }
  if (type === "Result") {
    return 2;
  }
  if (type === "Event") {
    return 1;
  }
  return 0.5;
}

function recencyBoost(timestamp: string): number {
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  const ageMinutes = Math.max(1, (Date.now() - parsed) / 60000);
  return 1 / Math.log2(2 + ageMinutes);
}

export function rankNotifications(
  items: NotificationItem[],
  topN: number
): RankedNotification[] {
  const ranked = items.map((item) => ({
    ...item,
    score: typeWeight(item.type) + recencyBoost(item.timestamp)
  }));

  return ranked.sort((a, b) => b.score - a.score).slice(0, topN);
}
