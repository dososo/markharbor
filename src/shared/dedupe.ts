import type { XBookmark } from "./types";

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0].split("#")[0];
  }
}

function keyFor(bookmark: XBookmark): string {
  return bookmark.id ? `id:${bookmark.id}` : `url:${normalizeUrl(bookmark.url)}`;
}

export function mergeBookmarks(existing: XBookmark[], incoming: XBookmark[]): XBookmark[] {
  const merged: XBookmark[] = [];
  const indexByKey = new Map<string, number>();

  function keysFor(bookmark: XBookmark): string[] {
    const keys = [`url:${normalizeUrl(bookmark.url)}`];

    if (bookmark.id) {
      keys.push(`id:${bookmark.id}`);
    }

    return keys;
  }

  function setBookmark(bookmark: XBookmark): void {
    const keys = keysFor(bookmark);
    const existingIndex = indexByKey.get(keyFor(bookmark)) ?? indexByKey.get(keys[0]);
    const index = existingIndex ?? merged.length;

    if (existingIndex !== undefined) {
      for (const key of keysFor(merged[existingIndex])) {
        indexByKey.delete(key);
      }
    }

    merged[index] = bookmark;

    for (const key of keys) {
      indexByKey.set(key, index);
    }
  }

  for (const bookmark of existing) {
    setBookmark(bookmark);
  }

  for (const bookmark of incoming) {
    setBookmark(bookmark);
  }

  return merged;
}
