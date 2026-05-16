import { describe, expect, it } from "vitest";
import {
  renderBookmarksCsv,
  renderBookmarksHtml,
  renderExportReport,
  renderLinksText,
  renderMediaManifest
} from "./exportFormats";
import type { ExportReport, ExportedMediaItem, XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread, with comma",
  postedAt: "2026-05-15T12:30:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
  linkCard: {
    url: "https://example.com/article",
    title: "Example article"
  },
  rawText: "raw"
};

describe("export format renderers", () => {
  it("renders a plain text link list", () => {
    expect(renderLinksText([bookmark])).toBe("https://x.com/alice/status/123\n");
    expect(renderLinksText([])).toBe("");
  });

  it("renders bookmarks CSV with escaped values", () => {
    const csv = renderBookmarksCsv([bookmark]);

    expect(csv).toContain("id,url,author_name,author_handle,text,posted_at,collected_at,image_urls,link_card_url,link_card_title");
    expect(csv).toContain('"Useful thread, with comma"');
    expect(csv).toContain("https://example.com/article");
  });

  it("renders a browsable HTML export", () => {
    const html = renderBookmarksHtml([bookmark]);

    expect(html).toContain("<title>X Bookmarks Export</title>");
    expect(html).toContain("Alice");
    expect(html).toContain("Useful thread, with comma");
    expect(html).toContain("https://x.com/alice/status/123");
    expect(html).toContain("https://example.com/article");
  });

  it("renders media manifest JSON", () => {
    const mediaItems: ExportedMediaItem[] = [{
      bookmarkId: "123",
      bookmarkUrl: bookmark.url,
      kind: "image",
      originalUrl: bookmark.imageUrls[0],
      localPath: "attachments/x-bookmarks/123/image-01-example.jpg",
      status: "downloaded"
    }];

    expect(renderMediaManifest(mediaItems)).toContain('"status": "downloaded"');
  });

  it("renders export report JSON", () => {
    const report: ExportReport = {
      exportedAt: "2026-05-16T00:00:00.000Z",
      bookmarkCount: 1,
      generatedFileCount: 8,
      mediaDownloadedCount: 1,
      mediaFailedCount: 0,
      videoSkippedCount: 0
    };

    expect(renderExportReport(report)).toContain('"bookmarkCount": 1');
  });
});
