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

function imageExtensionFromUrl(url: URL): string | undefined {
  const format = url.searchParams.get("format")?.toLowerCase();
  if (!format) {
    return undefined;
  }

  if (format === "jpeg") {
    return "jpg";
  }

  return ["jpg", "png", "webp", "gif"].includes(format) ? format : undefined;
}

function withImageExtension(fileName: string, url: URL): string {
  if (/\.(jpe?g|png|webp|gif)$/i.test(fileName)) {
    return fileName;
  }

  const extension = imageExtensionFromUrl(url);
  return extension ? `${fileName}.${extension}` : fileName;
}

export function imageFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop();
  if (!base) {
    return `image-${index}.jpg`;
  }

  const fileName = withImageExtension(safeFileName(decodeURIComponent(base)), parsed);

  return fileName ? `image-${index}-${fileName}` : `image-${index}.jpg`;
}

export function bookmarkAttachmentFolder(bookmark: XBookmark): string {
  const id = safeFileName(bookmark.id ?? "") || safeFileName(bookmark.url).slice(0, 48) || "bookmark";

  return `attachments/x-bookmarks/${id}`;
}

export function mediaFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop();
  const fileName = base ? withImageExtension(safeFileName(decodeURIComponent(base)), parsed) : "";
  const padded = String(index).padStart(2, "0");

  return fileName ? `image-${padded}-${fileName}` : `image-${padded}.jpg`;
}
