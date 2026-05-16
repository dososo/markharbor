import type { XBookmark } from "./types";

export function safeFileName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/[^a-zA-Z0-9@._ -]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function bookmarkFileName(bookmark: XBookmark): string {
  const date = (bookmark.postedAt ?? bookmark.collectedAt).slice(0, 10);
  const author = safeFileName(bookmark.authorName ?? "") || safeFileName(bookmark.authorHandle ?? "") || "unknown";
  const text = safeFileName(bookmark.text).slice(0, 60);
  const title = text || safeFileName(bookmark.id ?? "bookmark") || "bookmark";

  return `${date}-${author}-${title}.md`;
}

export function imageFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop();
  if (!base) {
    return `image-${index}.jpg`;
  }

  const fileName = safeFileName(decodeURIComponent(base));

  return fileName ? `image-${index}-${fileName}` : `image-${index}.jpg`;
}

export function bookmarkAttachmentFolder(bookmark: XBookmark): string {
  const id = safeFileName(bookmark.id ?? "") || safeFileName(bookmark.url).slice(0, 48) || "bookmark";

  return `attachments/x-bookmarks/${id}`;
}

export function mediaFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop();
  const fileName = base ? safeFileName(decodeURIComponent(base)) : "";
  const padded = String(index).padStart(2, "0");

  return fileName ? `image-${padded}-${fileName}` : `image-${padded}.jpg`;
}
