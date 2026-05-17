import type { ExportReport, ExportedMediaItem, XBookmark } from "./types";
import { renderContentBlocksHtml } from "./contentBlocks";

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

function textSourceLabel(bookmark: XBookmark): string {
  return bookmark.textSource === "post-detail" ? "原帖详情页" : "书签列表";
}

function textEnhancementStatusLabel(bookmark: XBookmark): string {
  switch (bookmark.textEnhancementStatus) {
    case "success":
      return "成功";
    case "failed":
      return "失败，已回退到书签列表正文";
    default:
      return "无需增强";
  }
}

function bookmarkBodyHtml(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  if (bookmark.contentBlocks && bookmark.contentBlocks.length > 0) {
    return renderContentBlocksHtml(bookmark.contentBlocks, imagePaths);
  }

  return `<p>${htmlEscape(bookmark.text || "No visible text captured.")}</p>`;
}

function bookmarkMediaHtml(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  const inlineImageUrls = new Set((bookmark.contentBlocks ?? [])
    .filter((block) => block.type === "image")
    .map((block) => block.url));
  const mediaUrls = [
    ...bookmark.imageUrls,
    bookmark.linkCard?.imageUrl
  ].filter((url): url is string => Boolean(url))
    .filter((url) => !inlineImageUrls.has(url));

  return mediaUrls.map((url) => {
    const destination = imagePaths.get(url) ?? url;
    return `<figure><img src="${htmlEscape(destination)}" alt="" /></figure>`;
  }).join("");
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
    "text_source",
    "text_enhancement_status",
    "posted_at",
    "collected_at",
    "image_urls",
    "article_title",
    "article_preview",
    "link_card_url",
    "link_card_title",
    "link_card_description"
  ];
  const rows = bookmarks.map((bookmark) => [
    bookmark.id,
    bookmark.url,
    bookmark.authorName,
    bookmark.authorHandle,
    bookmark.text,
    bookmark.textSource ?? "bookmarks-list",
    bookmark.textEnhancementStatus ?? "not-needed",
    bookmark.postedAt,
    bookmark.collectedAt,
    bookmark.imageUrls.join(" | "),
    bookmark.article?.title,
    bookmark.article?.preview,
    bookmark.linkCard?.url,
    bookmark.linkCard?.title,
    bookmark.linkCard?.description
  ].map(csvCell).join(","));

  return [header.join(","), ...rows].join("\n");
}

export function renderBookmarksHtml(bookmarks: XBookmark[], imagePaths = new Map<string, string>()): string {
  const items = bookmarks.map((bookmark) => {
    const title = bookmark.authorName ?? bookmark.authorHandle ?? bookmark.url;
    const linkCard = bookmark.linkCard?.url
      ? [
        `<p><strong>Link card:</strong> <a href="${htmlEscape(bookmark.linkCard.url)}">${htmlEscape(bookmark.linkCard.title ?? bookmark.linkCard.url)}</a></p>`,
        bookmark.linkCard.description ? `<p>${htmlEscape(bookmark.linkCard.description)}</p>` : ""
      ].join("")
      : "";
    const article = bookmark.article
      ? [
        bookmark.article.title ? `<p><strong>X 文章标题：</strong>${htmlEscape(bookmark.article.title)}</p>` : "",
        bookmark.article.preview ? `<p><strong>X 文章摘要：</strong>${htmlEscape(bookmark.article.preview)}</p>` : ""
      ].join("")
      : "";

    return [
      "<article>",
      `<h2>${htmlEscape(title)}</h2>`,
      bookmarkBodyHtml(bookmark, imagePaths),
      `<p>正文来源：${htmlEscape(textSourceLabel(bookmark))}；正文增强：${htmlEscape(textEnhancementStatusLabel(bookmark))}</p>`,
      article,
      linkCard,
      bookmarkMediaHtml(bookmark, imagePaths),
      `<p><a href="${htmlEscape(bookmark.url)}">Source post</a></p>`,
      "</article>"
    ].join("");
  }).join("\n");

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    "<title>MarkHarbor Export</title>",
    "</head>",
    "<body>",
    "<h1>MarkHarbor Export</h1>",
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
