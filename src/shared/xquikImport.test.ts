import { describe, expect, it } from "vitest";
import {
  normalizeXquikBookmark,
  normalizeXquikBookmarks
} from "./xquikImport";

describe("Xquik import helpers", () => {
  it("normalizes Xquik bookmark records into MarkHarbor bookmarks", () => {
    const bookmark = normalizeXquikBookmark({
      id: "123",
      authorName: "Alice",
      authorHandle: "alice",
      fullText: "Useful local-first thread",
      createdAt: "2026-06-01T00:00:00.000Z",
      imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
      media: [{ type: "video", url: "https://video.twimg.com/example.mp4", previewImageUrl: "https://pbs.twimg.com/media/preview.jpg" }],
      linkCard: {
        url: "https://example.com",
        title: "Example",
        description: "Example description"
      }
    }, "2026-06-02T00:00:00.000Z");

    expect(bookmark).toEqual({
      id: "123",
      url: "https://x.com/i/web/status/123",
      authorName: "Alice",
      authorHandle: "@alice",
      text: "Useful local-first thread",
      textSource: "post-detail",
      textEnhancementStatus: "success",
      postedAt: "2026-06-01T00:00:00.000Z",
      collectedAt: "2026-06-02T00:00:00.000Z",
      imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
      linkCard: {
        url: "https://example.com",
        title: "Example",
        description: "Example description"
      },
      video: {
        sourceUrl: "https://video.twimg.com/example.mp4",
        previewImageUrl: "https://pbs.twimg.com/media/preview.jpg"
      },
      rawText: "Useful local-first thread"
    });
  });

  it("filters empty records from Xquik imports", () => {
    expect(normalizeXquikBookmarks([
      {},
      { tweetUrl: "https://x.com/bob/status/456", text: "Keep this" }
    ], "2026-06-02T00:00:00.000Z")).toHaveLength(1);
  });
});
