import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CollectionState, XBookmark } from "../shared/types";

const emptyState: CollectionState = {
  bookmarks: [],
  isCollecting: false,
  lastScanAdded: 0,
  runAdded: 0,
  scrollAttempts: 0,
  idleScans: 0
};

const staleBookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Previously collected",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: [],
  rawText: "Previously collected"
};

const staleState: CollectionState = {
  bookmarks: [staleBookmark],
  isCollecting: false,
  lastScanAdded: 1,
  runAdded: 1,
  scrollAttempts: 2,
  idleScans: 0
};

async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("popup main", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    localStorage.setItem("x-bookmarks-language", "zh");
    vi.stubGlobal("chrome", {
      tabs: {
        query: vi.fn(async () => [{ id: 1 }]),
        sendMessage: vi.fn(async () => ({
          ok: false,
          errorKey: "openBookmarksError",
          state: emptyState
        }))
      },
      scripting: {
        executeScript: vi.fn(async () => undefined)
      },
      downloads: {
        download: vi.fn()
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("re-renders the current error from its localization key when language changes", async () => {
    await import("./main");
    await flushAsyncWork();

    expect(document.body.textContent).toContain("请先打开 X Bookmarks 页面");
    expect(document.querySelector<HTMLAnchorElement>(".error a")?.href).toBe("https://x.com/i/bookmarks");

    document.querySelector<HTMLButtonElement>("#langEn")?.click();

    expect(document.body.textContent).toContain("Open the X Bookmarks page");
    expect(document.body.textContent).toContain("Open X Bookmarks");
  });

  it("does not show stale collected bookmarks before the user starts this popup session", async () => {
    vi.mocked(chrome.tabs.sendMessage).mockResolvedValueOnce({
      ok: true,
      bookmarks: [staleBookmark],
      state: staleState
    });

    await import("./main");
    await flushAsyncWork();

    expect(document.body.textContent).toContain("已采集0");
    expect(document.body.textContent).toContain("本轮新增0");
    expect(document.body.textContent).toContain("滚动次数0");
  });

  it("injects the content script into an already-open bookmarks tab when messaging is not ready", async () => {
    vi.mocked(chrome.tabs.query).mockResolvedValueOnce([{
      id: 1,
      url: "https://x.com/i/bookmarks"
    } as chrome.tabs.Tab]);
    vi.mocked(chrome.tabs.sendMessage)
      .mockRejectedValueOnce(new Error("Could not establish connection. Receiving end does not exist."))
      .mockResolvedValueOnce({
        ok: true,
        bookmarks: [],
        state: emptyState
      });

    await import("./main");
    await flushAsyncWork();

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 1 },
      files: ["assets/content.js"]
    });
    expect(document.body.textContent).toContain("页面可用");
  });

  it("shows a prominent working state while collection is running", async () => {
    vi.mocked(chrome.tabs.sendMessage).mockResolvedValueOnce({
      ok: true,
      bookmarks: [],
      state: {
        ...emptyState,
        isCollecting: true,
        currentStage: "enhancing",
        currentItemTitle: "示例长文"
      }
    });

    await import("./main");
    await flushAsyncWork();

    expect(document.querySelector(".progress-card.active")).toBeTruthy();
    expect(document.body.textContent).toContain("采集中，请保持 X Bookmarks 页面打开");
    expect(document.body.textContent).toContain("示例长文");
  });
});
