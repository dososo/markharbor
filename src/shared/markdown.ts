import type { ExportReport, XBookmark } from "./types";

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

function titleText(bookmark: XBookmark): string {
  const author = bookmark.authorName || bookmark.authorHandle || "Unknown";
  const text = bookmark.text.trim() || bookmark.id || "Bookmark";
  const shortText = text.length > 72 ? `${text.slice(0, 72).trim()}...` : text;

  return `${author} - ${shortText}`;
}

function noteImageDestination(destination: string): string {
  if (destination.startsWith("attachments/")) {
    return `../${destination}`;
  }

  if (destination.startsWith("../") || destination.startsWith("./")) {
    return destination;
  }

  return markdownDestination(destination);
}

function noteImageLines(bookmark: XBookmark, imagePaths: Map<string, string>): string[] {
  const lines = bookmark.imageUrls.map((url) => {
    const destination = imagePaths.get(url) ?? url;
    return `![](${noteImageDestination(destination)})`;
  });

  if (bookmark.linkCard?.imageUrl) {
    const destination = imagePaths.get(bookmark.linkCard.imageUrl) ?? bookmark.linkCard.imageUrl;
    lines.push(`![](${noteImageDestination(destination)})`);
  }

  return lines;
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
  const title = titleText(bookmark);
  const mediaLines = [
    ...noteImageLines(bookmark, imagePaths),
    ...videoLines(bookmark)
  ];
  const linkCardLines = bookmark.linkCard ? [
    "## 链接卡片",
    "",
    bookmark.linkCard.title ? `- 标题： ${bookmark.linkCard.title}` : undefined,
    bookmark.linkCard.description ? `- 描述： ${bookmark.linkCard.description}` : undefined,
    bookmark.linkCard.url ? `- 链接： ${markdownDestination(bookmark.linkCard.url)}` : undefined,
    ""
  ].filter((line): line is string => line !== undefined) : [];

  return [
    "---",
    `title: ${escapeYaml(title)}`,
    'source: "x-bookmarks"',
    `x_url: ${escapeYaml(bookmark.url)}`,
    `author: ${escapeYaml(bookmark.authorName)}`,
    `handle: ${escapeYaml(bookmark.authorHandle)}`,
    `posted_at: ${escapeYaml(bookmark.postedAt)}`,
    `collected_at: ${escapeYaml(bookmark.collectedAt)}`,
    `bookmark_id: ${escapeYaml(bookmark.id)}`,
    `link_card_url: ${escapeYaml(bookmark.linkCard?.url)}`,
    "tags:",
    "  - x-bookmarks",
    "---",
    "",
    `# ${title}`,
    "",
    "## 原文",
    "",
    bookmark.text || "（未采集到可见正文）",
    "",
    ...linkCardLines,
    "## 媒体",
    "",
    ...(mediaLines.length > 0 ? mediaLines : ["（无媒体）"]),
    "",
    "## 来源",
    "",
    `- 原帖： ${markdownDestination(bookmark.url)}`,
    bookmark.postedAt ? `- 发布时间： ${bookmark.postedAt}` : undefined,
    "",
    "## 我的笔记",
    ""
  ].filter((line): line is string => line !== undefined).join("\n");
}

function obsidianLinkPath(notePath: string): string {
  return notePath.endsWith(".md") ? notePath.slice(0, -3) : notePath;
}

export function renderIndexMarkdown(
  bookmarks: XBookmark[],
  notePaths: Map<string, string>,
  report: ExportReport
): string {
  const links = bookmarks.map((bookmark) => {
    const notePath = notePaths.get(bookmark.url);
    const title = titleText(bookmark);

    return notePath
      ? `- [[${obsidianLinkPath(notePath)}|${title}]]`
      : `- [${title}](${markdownDestination(bookmark.url)})`;
  });

  return [
    "# X Bookmarks Index",
    "",
    `导出时间： ${report.exportedAt}`,
    `书签数量： ${report.bookmarkCount}`,
    `媒体成功： ${report.mediaDownloadedCount}`,
    `媒体失败： ${report.mediaFailedCount}`,
    "",
    "## 书签",
    "",
    ...links
  ].join("\n");
}
