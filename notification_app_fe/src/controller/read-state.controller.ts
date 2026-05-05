import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "notification.read.ids";

function loadReadIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistReadIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useReadState() {
  const [ids, setIds] = useState<string[]>(() => loadReadIds());
  const readSet = useMemo(() => new Set(ids), [ids]);

  useEffect(() => {
    persistReadIds(ids);
  }, [ids]);

  const markRead = (id: string) => {
    if (readSet.has(id)) {
      return;
    }
    setIds((prev) => [...prev, id]);
  };

  const markAll = (list: string[]) => {
    const next = new Set(ids);
    list.forEach((id) => next.add(id));
    setIds([...next]);
  };

  const isRead = (id: string) => readSet.has(id);

  return {
    isRead,
    markRead,
    markAll,
    readIds: ids
  };
}
