import { describe, expect, it } from "vitest";
import { renderBookmarkMarkdown, renderCombinedMarkdown, renderIndexMarkdown } from "./markdown";
import type { ExportReport, XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread",
  postedAt: "2026-05-15T12:30:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
  linkCard: {
    url: "https://example.com/article",
    title: "Example article",
    description: "Example description",
    imageUrl: "https://pbs.twimg.com/card_img/example.jpg"
  },
  video: {
    sourceUrl: "https://x.com/alice/status/123",
    previewImageUrl: "https://pbs.twimg.com/thumb.jpg"
  },
  rawText: "raw"
};

describe("renderCombinedMarkdown", () => {
  it("includes title source link local image reference and video line", () => {
    const markdown = renderCombinedMarkdown(
      [bookmark],
      new Map([[bookmark.imageUrls[0], "attachments/x-bookmarks/example.jpg"]])
    );

    expect(markdown).toContain("# X Bookmarks Export");
    expect(markdown).toContain("## Alice");
    expect(markdown).toContain("[原帖](<https://x.com/alice/status/123>)");
    expect(markdown).toContain("![](<attachments/x-bookmarks/example.jpg>)");
    expect(markdown).toContain("视频： https://x.com/alice/status/123");
    expect(markdown).toContain("视频预览： https://pbs.twimg.com/thumb.jpg");
  });

  it("wraps link destinations containing closing parens in angle brackets", () => {
    const markdown = renderCombinedMarkdown(
      [{
        ...bookmark,
        url: "https://x.com/alice/status/123?note=hello)",
        imageUrls: ["https://pbs.twimg.com/media/example).jpg"]
      }],
      new Map([["https://pbs.twimg.com/media/example).jpg", "attachments/x-bookmarks/example).jpg"]])
    );

    expect(markdown).toContain("[原帖](<https://x.com/alice/status/123?note=hello)>)");
    expect(markdown).toContain("![](<attachments/x-bookmarks/example).jpg>)");
  });
});

describe("renderBookmarkMarkdown", () => {
  it("includes useful Obsidian front matter sections and local media paths", () => {
    const markdown = renderBookmarkMarkdown(
      bookmark,
      new Map([[bookmark.imageUrls[0], "attachments/x-bookmarks/123/image-01-example.jpg"]])
    );

    expect(markdown).toContain("title:");
    expect(markdown).toContain('source: "x-bookmarks"');
    expect(markdown).toContain('x_url: "https://x.com/alice/status/123"');
    expect(markdown).toContain('bookmark_id: "123"');
    expect(markdown).toContain("## 原文");
    expect(markdown).toContain("## 链接卡片");
    expect(markdown).toContain("## 媒体");
    expect(markdown).toContain("## 来源");
    expect(markdown).toContain("## 我的笔记");
    expect(markdown).toContain("Useful thread");
    expect(markdown).toContain("![](../attachments/x-bookmarks/123/image-01-example.jpg)");
  });

  it("escapes YAML double quotes and backslashes", () => {
    const markdown = renderBookmarkMarkdown(
      {
        ...bookmark,
        authorName: 'A "Quoted" \\ Author'
      },
      new Map()
    );

    expect(markdown).toContain('author: "A \\"Quoted\\" \\\\ Author"');
  });

  it("escapes YAML newlines as one-line values", () => {
    const markdown = renderBookmarkMarkdown(
      {
        ...bookmark,
        authorName: "Alice\nAdmin"
      },
      new Map()
    );

    expect(markdown).toContain('author: "Alice\\nAdmin"');
    expect(markdown).not.toContain("author: \"Alice\nAdmin\"");
  });

  it("falls back to image URLs when local paths are missing", () => {
    const markdown = renderBookmarkMarkdown(bookmark, new Map());

    expect(markdown).toContain("![](<https://pbs.twimg.com/media/example.jpg>)");
  });

  it("marks empty body text honestly", () => {
    const markdown = renderBookmarkMarkdown({ ...bookmark, text: "" }, new Map());

    expect(markdown).toContain("（未采集到可见正文）");
  });
});

describe("renderIndexMarkdown", () => {
  it("links to per-bookmark notes and summarizes export status", () => {
    const report: ExportReport = {
      exportedAt: "2026-05-16T00:00:00.000Z",
      bookmarkCount: 1,
      generatedFileCount: 8,
      mediaDownloadedCount: 1,
      mediaFailedCount: 0,
      videoSkippedCount: 1
    };
    const markdown = renderIndexMarkdown(
      [bookmark],
      new Map([[bookmark.url, "bookmarks/2026-05-16-alice-useful-thread.md"]]),
      report
    );

    expect(markdown).toContain("# X Bookmarks Index");
    expect(markdown).toContain("导出时间： 2026-05-16T00:00:00.000Z");
    expect(markdown).toContain("[[bookmarks/2026-05-16-alice-useful-thread|Alice - Useful thread]]");
  });
});
