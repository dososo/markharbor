import { mergeBookmarks } from "../shared/dedupe";
import type { ContentToPopupResponse } from "../shared/messages";
import type { CollectionState, XBookmark } from "../shared/types";
import { enhanceBookmarkText as defaultEnhanceBookmarkText } from "./enrichText";
import { parseBookmarksFromDocument } from "./parseBookmarks";

const DEFAULT_MAX_SCROLL_ATTEMPTS = 200;
const DEFAULT_STABLE_BOTTOM_SCANS_TO_STOP = 3;
const DEFAULT_SCAN_DELAY_MS = 1200;
const BOTTOM_THRESHOLD_PX = 32;

interface PageMetrics {
  scrollY: number;
  innerHeight: number;
  scrollHeight: number;
}

interface CollectionControllerOptions {
  doc?: Document;
  getLocation?: () => Location;
  getNow?: () => string;
  delay?: () => Promise<void>;
  scrollPage?: () => void;
  getPageMetrics?: () => PageMetrics;
  maxScrollAttempts?: number;
  stableBottomScansToStop?: number;
  enhanceBookmarkText?: (bookmark: XBookmark, options?: { fullArticleImages?: boolean }) => Promise<XBookmark>;
}

export interface CollectionController {
  state: CollectionState;
  handleMessage: (message: unknown) => ContentToPopupResponse;
  whenIdle: () => Promise<void>;
}

function initialState(): CollectionState {
  return {
    bookmarks: [],
    isCollecting: false,
    lastScanAdded: 0,
    runAdded: 0,
    scrollAttempts: 0,
    idleScans: 0
  };
}

function defaultDelay(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, DEFAULT_SCAN_DELAY_MS));
}

function defaultScrollPage(): void {
  window.scrollBy({
    top: window.innerHeight * 0.85,
    behavior: "smooth"
  });
}

function defaultPageMetrics(): PageMetrics {
  const documentHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );

  return {
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    scrollHeight: documentHeight
  };
}

function isBookmarksPage(location: Location): boolean {
  return location.hostname === "x.com" && location.pathname.startsWith("/i/bookmarks");
}

function isAtBottom(metrics: PageMetrics): boolean {
  return metrics.scrollY + metrics.innerHeight >= metrics.scrollHeight - BOTTOM_THRESHOLD_PX;
}

function messageType(message: unknown): string | undefined {
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return undefined;
  }

  const type = message.type;

  return typeof type === "string" ? type : undefined;
}

export function createCollectionController(options: CollectionControllerOptions = {}): CollectionController {
  const doc = options.doc ?? document;
  const getLocation = options.getLocation ?? (() => window.location);
  const getNow = options.getNow ?? (() => new Date().toISOString());
  const delay = options.delay ?? defaultDelay;
  const getPageMetrics = options.getPageMetrics ?? defaultPageMetrics;
  const maxScrollAttempts = options.maxScrollAttempts ?? DEFAULT_MAX_SCROLL_ATTEMPTS;
  const stableBottomScansToStop = options.stableBottomScansToStop ?? DEFAULT_STABLE_BOTTOM_SCANS_TO_STOP;
  const enhanceBookmarkText: NonNullable<CollectionControllerOptions["enhanceBookmarkText"]> = options.enhanceBookmarkText
    ?? ((bookmark, enhancementOptions) => defaultEnhanceBookmarkText(bookmark, undefined, undefined, enhancementOptions));
  const state = initialState();

  let nextRunId = 1;
  let activeRunId: number | undefined;
  let currentRun: Promise<void> | undefined;
  let fullArticleImages = true;
  const enhancedUrls = new Set<string>();
  const enhancedBookmarks = new Map<string, XBookmark>();
  const enhancementQueue: Array<() => Promise<void>> = [];

  const scrollPage = options.scrollPage ?? defaultScrollPage;

  function bookmarkTitle(bookmark: XBookmark): string {
    return bookmark.article?.title
      ?? bookmark.linkCard?.title
      ?? bookmark.text.split("\n").find((line) => line.trim())?.trim()
      ?? bookmark.url;
  }

  function applyEnhancedBookmarks(): void {
    state.bookmarks = state.bookmarks.map((bookmark) => enhancedBookmarks.get(bookmark.url) ?? bookmark);
  }

  function scan(): XBookmark[] {
    const parsed = parseBookmarksFromDocument(doc, getNow());
    const previousUrls = new Set(state.bookmarks.map((bookmark) => bookmark.url));
    const previousLength = state.bookmarks.length;
    state.bookmarks = mergeBookmarks(state.bookmarks, parsed);
    applyEnhancedBookmarks();
    state.lastScanAdded = state.bookmarks.length - previousLength;
    state.runAdded += state.lastScanAdded;

    if (state.lastScanAdded === 0) {
      state.idleScans += 1;
    } else {
      state.idleScans = 0;
    }

    return parsed.filter((bookmark) => !previousUrls.has(bookmark.url) && !enhancedUrls.has(bookmark.url));
  }

  function queueBookmarkEnhancements(bookmarks: XBookmark[], runId: number): void {
    for (const bookmark of bookmarks) {
      if (enhancedUrls.has(bookmark.url)) {
        continue;
      }

      enhancedUrls.add(bookmark.url);
      enhancementQueue.push(async () => {
        try {
          if (!isCurrentRun(runId)) {
            return;
          }

          state.currentStage = "enhancing";
          state.currentItemTitle = bookmarkTitle(bookmark);
          state.currentItemUrl = bookmark.url;
          const enhancedBookmark = await enhanceBookmarkText(bookmark, { fullArticleImages });
          if (!isCurrentRun(runId)) {
            return;
          }

          enhancedBookmarks.set(bookmark.url, enhancedBookmark);
          state.bookmarks = state.bookmarks.map((currentBookmark) => (
            currentBookmark.url === bookmark.url ? enhancedBookmark : currentBookmark
          ));
        } catch {
          // 单条详情增强失败时保留列表页数据，不中断整轮采集。
        }
      });
    }
  }

  async function processNextEnhancement(): Promise<void> {
    if (activeRunId === undefined) {
      enhancementQueue.length = 0;
      return;
    }

    const nextTask = enhancementQueue.shift();
    if (nextTask) {
      await nextTask();
    }
  }

  function isCurrentRun(runId: number): boolean {
    return activeRunId === runId;
  }

  async function collectLoop(): Promise<void> {
    const runId = nextRunId;
    nextRunId += 1;
    activeRunId = runId;
    state.isCollecting = true;
    state.scrollAttempts = 0;
    state.idleScans = 0;
    state.lastScanAdded = 0;
    state.runAdded = 0;
    state.currentStage = "scanning";
    state.currentItemTitle = undefined;
    state.currentItemUrl = undefined;

    let previousHeight = getPageMetrics().scrollHeight;
    let stableBottomScans = 0;

    while (
      isCurrentRun(runId) &&
      state.isCollecting &&
      state.scrollAttempts < maxScrollAttempts &&
      stableBottomScans < stableBottomScansToStop
    ) {
      state.currentStage = "scanning";
      state.currentItemTitle = undefined;
      state.currentItemUrl = undefined;
      const newBookmarks = scan();
      queueBookmarkEnhancements(newBookmarks, runId);
      await processNextEnhancement();
      if (!isCurrentRun(runId) || !state.isCollecting) {
        break;
      }
      state.currentStage = "scrolling";
      scrollPage();
      state.scrollAttempts += 1;
      await delay();

      const metrics = getPageMetrics();
      if (isAtBottom(metrics) && metrics.scrollHeight === previousHeight) {
        stableBottomScans += 1;
      } else {
        stableBottomScans = 0;
      }
      previousHeight = metrics.scrollHeight;
    }

    if (isCurrentRun(runId)) {
      const newBookmarks = scan();
      queueBookmarkEnhancements(newBookmarks, runId);
      while (enhancementQueue.length > 0 && isCurrentRun(runId)) {
        await processNextEnhancement();
      }
      applyEnhancedBookmarks();
      state.isCollecting = false;
      state.currentStage = "idle";
      state.currentItemTitle = undefined;
      state.currentItemUrl = undefined;
      activeRunId = undefined;
    }
  }

  function startCollection(): void {
    if (!state.isCollecting) {
      currentRun = collectLoop();
    }
  }

  function stopCollection(): void {
    activeRunId = undefined;
    enhancementQueue.length = 0;
    state.isCollecting = false;
    state.currentStage = "stopped";
    state.currentItemTitle = undefined;
    state.currentItemUrl = undefined;
  }

  function clearCollection(): void {
    activeRunId = undefined;
    state.bookmarks = [];
    state.isCollecting = false;
    state.lastScanAdded = 0;
    state.runAdded = 0;
    state.scrollAttempts = 0;
    state.idleScans = 0;
    state.currentStage = "idle";
    state.currentItemTitle = undefined;
    state.currentItemUrl = undefined;
    enhancedUrls.clear();
    enhancedBookmarks.clear();
    enhancementQueue.length = 0;
  }

  function resetForNewCollection(): void {
    state.bookmarks = [];
    state.lastScanAdded = 0;
    state.runAdded = 0;
    state.scrollAttempts = 0;
    state.idleScans = 0;
    state.currentStage = "idle";
    state.currentItemTitle = undefined;
    state.currentItemUrl = undefined;
    enhancedUrls.clear();
    enhancedBookmarks.clear();
    enhancementQueue.length = 0;
  }

  function handleMessage(message: unknown): ContentToPopupResponse {
    if (!isBookmarksPage(getLocation())) {
      return { ok: false, errorKey: "openBookmarksError", state };
    }

    switch (messageType(message)) {
      case "GET_STATUS":
        return { ok: true, bookmarks: state.bookmarks, state };

      case "START_COLLECTION":
        fullArticleImages = typeof message === "object"
          && message !== null
          && "fullArticleImages" in message
          ? message.fullArticleImages !== false
          : true;
        if (!state.isCollecting) {
          resetForNewCollection();
        }
        startCollection();
        return { ok: true, bookmarks: state.bookmarks, state };

      case "STOP_COLLECTION":
        stopCollection();
        return { ok: true, bookmarks: state.bookmarks, state };

      case "CLEAR_COLLECTION":
        clearCollection();
        return { ok: true, bookmarks: state.bookmarks, state };

      default:
        return { ok: false, errorKey: "unknownOperationError", state };
    }
  }

  return {
    state,
    handleMessage,
    whenIdle: () => currentRun ?? Promise.resolve()
  };
}
