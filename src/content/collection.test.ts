import { describe, expect, it } from "vitest";
import { xBookmarkCardHtml } from "../test/fixtures/xBookmarkCard";
import { createCollectionController } from "./collection";
import type { XBookmark } from "../shared/types";

function bookmarkDocument(): Document {
  document.body.innerHTML = xBookmarkCardHtml;
  return document;
}

function xBookmarksLocation(): Location {
  return new URL("https://x.com/i/bookmarks") as unknown as Location;
}

async function keepBookmark(bookmark: XBookmark): Promise<XBookmark> {
  return bookmark;
}

describe("createCollectionController", () => {
  it("does not scan the page when only reading status", () => {
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation
    });

    const response = controller.handleMessage({ type: "GET_STATUS" });

    expect(response.ok).toBe(true);
    if (!response.ok) throw new Error("Expected status response to succeed.");
    expect(response.state.bookmarks).toHaveLength(0);
  });

  it("tracks newly collected bookmarks for the current run", () => {
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation,
      scrollPage: () => undefined,
      delay: () => new Promise(() => undefined),
      enhanceBookmarkText: keepBookmark
    });

    const response = controller.handleMessage({ type: "START_COLLECTION" });

    expect(response.ok).toBe(true);
    if (!response.ok) throw new Error("Expected start response to succeed.");
    expect(response.state.bookmarks).toHaveLength(2);
    expect(response.state.runAdded).toBe(2);
  });

  it("enhances only newly collected bookmarks and does not repeat detail requests", async () => {
    const enhanceBookmarkText = vi.fn(async (bookmark) => ({
      ...bookmark,
      text: `${bookmark.text} full`,
      textSource: "post-detail" as const,
      textEnhancementStatus: "success" as const
    }));
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation,
      delay: async () => undefined,
      maxScrollAttempts: 2,
      scrollPage: () => undefined,
      enhanceBookmarkText
    });

    controller.handleMessage({ type: "START_COLLECTION" });
    await controller.whenIdle();

    expect(enhanceBookmarkText).toHaveBeenCalledTimes(2);
    expect(controller.state.bookmarks[0].text).toContain("full");
    expect(controller.state.bookmarks[0].textEnhancementStatus).toBe("success");
  });

  it("starts a new collection from a clean state so stale empty bookmarks are enhanced", async () => {
    const enhanceBookmarkText = vi.fn(async (bookmark) => ({
      ...bookmark,
      text: "Full text from detail page",
      textSource: "post-detail" as const,
      textEnhancementStatus: "success" as const
    }));
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation,
      delay: async () => undefined,
      maxScrollAttempts: 1,
      scrollPage: () => undefined,
      enhanceBookmarkText
    });
    controller.state.bookmarks = [{
      id: "1234567890",
      url: "https://x.com/alice/status/1234567890",
      authorName: "Alice Zhang",
      authorHandle: "@alice",
      text: "",
      textSource: "bookmarks-list",
      textEnhancementStatus: "not-needed",
      collectedAt: "2026-05-16T00:00:00.000Z",
      imageUrls: [],
      rawText: ""
    }];

    controller.handleMessage({ type: "START_COLLECTION" });
    await controller.whenIdle();

    expect(enhanceBookmarkText).toHaveBeenCalledWith(expect.objectContaining({
      url: "https://x.com/alice/status/1234567890"
    }));
    expect(controller.state.bookmarks[0].text).toBe("Full text from detail page");
    expect(controller.state.bookmarks[0].textEnhancementStatus).toBe("success");
  });

  it("does not stop collection only because scans are idle before page bottom", async () => {
    let scrolls = 0;
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation,
      delay: async () => undefined,
      getPageMetrics: () => ({
        scrollY: scrolls * 100,
        innerHeight: 600,
        scrollHeight: 5000
      }),
      maxScrollAttempts: 5,
      enhanceBookmarkText: keepBookmark,
      scrollPage: () => {
        scrolls += 1;
      }
    });

    controller.handleMessage({ type: "START_COLLECTION" });
    await controller.whenIdle();

    expect(scrolls).toBe(5);
    expect(controller.state.idleScans).toBeGreaterThan(3);
  });

  it("auto-stops after reaching the bottom with stable page height", async () => {
    let scrolls = 0;
    const controller = createCollectionController({
      doc: bookmarkDocument(),
      getLocation: xBookmarksLocation,
      delay: async () => undefined,
      getPageMetrics: () => ({
        scrollY: 4500,
        innerHeight: 600,
        scrollHeight: 5000
      }),
      maxScrollAttempts: 10,
      stableBottomScansToStop: 3,
      enhanceBookmarkText: keepBookmark,
      scrollPage: () => {
        scrolls += 1;
      }
    });

    controller.handleMessage({ type: "START_COLLECTION" });
    await controller.whenIdle();

    expect(scrolls).toBe(3);
    expect(controller.state.isCollecting).toBe(false);
  });
});
