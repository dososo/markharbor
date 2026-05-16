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
  const byKey = new Map<string, XBookmark>();

  for (const bookmark of existing) {
    byKey.set(keyFor(bookmark), bookmark);
  }

  for (const bookmark of incoming) {
    byKey.set(keyFor(bookmark), bookmark);
  }

  return Array.from(byKey.values());
}
