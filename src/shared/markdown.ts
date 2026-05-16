import type { XBookmark } from "./types";

function escapeYaml(value: string | undefined): string {
  const escaped = (value ?? "").replace(/[\u0000-\u001f\u007f\\"]/g, (char) => {
    switch (char) {
      case "\\":
        return "\\\\";
      case '"':
        return '\\"';
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      default:
        return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
    }
  });

  return `"${escaped}"`;
}

function markdownDestination(destination: string): string {
  const escaped = destination
    .replace(/\\/g, "\\\\")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>");

  return `<${escaped}>`;
}

function imageLines(bookmark: XBookmark, imagePaths: Map<string, string>): string[] {
  return bookmark.imageUrls.map((url) => `![](${markdownDestination(imagePaths.get(url) ?? url)})`);
}

function videoLines(bookmark: XBookmark): string[] {
  if (!bookmark.video) {
    return [];
  }

  return [
    `视频： ${bookmark.video.sourceUrl}`,
    bookmark.video.previewImageUrl ? `视频预览： ${bookmark.video.previewImageUrl}` : undefined
  ].filter((line): line is string => Boolean(line));
}

function bookmarkBody(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  return [
    bookmark.text,
    "",
    `[原帖](${markdownDestination(bookmark.url)})`,
    bookmark.postedAt ? `发布时间： ${bookmark.postedAt}` : undefined,
    ...imageLines(bookmark, imagePaths),
    ...videoLines(bookmark)
  ]
    .filter((line): line is string => line !== undefined)
    .join("\n\n");
}

export function renderCombinedMarkdown(bookmarks: XBookmark[], imagePaths: Map<string, string>): string {
  const sections = bookmarks.map((bookmark, index) => {
    const title = bookmark.authorName ?? bookmark.authorHandle ?? `Bookmark ${index + 1}`;

    return `## ${title}\n\n${bookmarkBody(bookmark, imagePaths)}`;
  });

  return ["# X Bookmarks Export", "", ...sections].join("\n");
}

export function renderBookmarkMarkdown(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  return [
    "---",
    "source: x-bookmarks",
    `url: ${escapeYaml(bookmark.url)}`,
    `author: ${escapeYaml(bookmark.authorName)}`,
    `handle: ${escapeYaml(bookmark.authorHandle)}`,
    `collected_at: ${escapeYaml(bookmark.collectedAt)}`,
    "tags:",
    "  - x-bookmarks",
    "---",
    "",
    bookmarkBody(bookmark, imagePaths)
  ].join("\n");
}
