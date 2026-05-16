import type { ExportReport, ExportedMediaItem, XBookmark } from "./types";

function csvCell(value: string | undefined): string {
  const text = value ?? "";
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function htmlEscape(value: string | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderLinksText(bookmarks: XBookmark[]): string {
  return bookmarks.length > 0 ? `${bookmarks.map((bookmark) => bookmark.url).join("\n")}\n` : "";
}

export function renderBookmarksCsv(bookmarks: XBookmark[]): string {
  const header = [
    "id",
    "url",
    "author_name",
    "author_handle",
    "text",
    "posted_at",
    "collected_at",
    "image_urls",
    "link_card_url",
    "link_card_title"
  ];
  const rows = bookmarks.map((bookmark) => [
    bookmark.id,
    bookmark.url,
    bookmark.authorName,
    bookmark.authorHandle,
    bookmark.text,
    bookmark.postedAt,
    bookmark.collectedAt,
    bookmark.imageUrls.join(" | "),
    bookmark.linkCard?.url,
    bookmark.linkCard?.title
  ].map(csvCell).join(","));

  return [header.join(","), ...rows].join("\n");
}

export function renderBookmarksHtml(bookmarks: XBookmark[]): string {
  const items = bookmarks.map((bookmark) => {
    const title = bookmark.authorName ?? bookmark.authorHandle ?? bookmark.url;
    const linkCard = bookmark.linkCard?.url
      ? `<p><strong>Link card:</strong> <a href="${htmlEscape(bookmark.linkCard.url)}">${htmlEscape(bookmark.linkCard.title ?? bookmark.linkCard.url)}</a></p>`
      : "";

    return [
      "<article>",
      `<h2>${htmlEscape(title)}</h2>`,
      `<p>${htmlEscape(bookmark.text || "No visible text captured.")}</p>`,
      linkCard,
      `<p><a href="${htmlEscape(bookmark.url)}">Source post</a></p>`,
      "</article>"
    ].join("");
  }).join("\n");

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    "<title>X Bookmarks Export</title>",
    "</head>",
    "<body>",
    "<h1>X Bookmarks Export</h1>",
    items,
    "</body>",
    "</html>"
  ].join("\n");
}

export function renderMediaManifest(items: ExportedMediaItem[]): string {
  return JSON.stringify(items, null, 2);
}

export function renderExportReport(report: ExportReport): string {
  return JSON.stringify(report, null, 2);
}
