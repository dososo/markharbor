import { describe, expect, it } from "vitest";
import { renderBookmarkMarkdown, renderCombinedMarkdown } from "./markdown";
import type { XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread",
  postedAt: "2026-05-15T12:30:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
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
    expect(markdown).toContain("[原帖](https://x.com/alice/status/123)");
    expect(markdown).toContain("![](attachments/x-bookmarks/example.jpg)");
    expect(markdown).toContain("视频： https://x.com/alice/status/123");
    expect(markdown).toContain("视频预览： https://pbs.twimg.com/thumb.jpg");
  });
});

describe("renderBookmarkMarkdown", () => {
  it("includes front matter url and body text", () => {
    const markdown = renderBookmarkMarkdown(bookmark, new Map());

    expect(markdown).toContain("source: x-bookmarks");
    expect(markdown).toContain('url: "https://x.com/alice/status/123"');
    expect(markdown).toContain("Useful thread");
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

  it("falls back to image URLs when local paths are missing", () => {
    const markdown = renderBookmarkMarkdown(bookmark, new Map());

    expect(markdown).toContain("![](https://pbs.twimg.com/media/example.jpg)");
  });
});
