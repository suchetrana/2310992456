const readIds = new Set<string>();
let lastSeenIds: string[] = [];

export function markRead(id: string): void {
  readIds.add(id);
}

export function markAll(ids: string[]): void {
  ids.forEach((id) => readIds.add(id));
}

export function isRead(id: string): boolean {
  return readIds.has(id);
}

export function setLastSeenIds(ids: string[]): void {
  lastSeenIds = [...ids];
}

export function getLastSeenIds(): string[] {
  return [...lastSeenIds];
}

export function getUnreadCount(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    if (!readIds.has(id)) {
      count += 1;
    }
  }
  return count;
}
