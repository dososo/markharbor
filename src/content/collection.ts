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
  enhanceBookmarkText?: (bookmark: XBookmark) => Promise<XBookmark>;
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
  const enhanceBookmarkText = options.enhanceBookmarkText ?? defaultEnhanceBookmarkText;
  const state = initialState();

  let nextRunId = 1;
  let activeRunId: number | undefined;
  let currentRun: Promise<void> | undefined;
  const enhancedUrls = new Set<string>();
  const enhancedBookmarks = new Map<string, XBookmark>();

  const scrollPage = options.scrollPage ?? defaultScrollPage;

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

  async function enhanceNewBookmarks(bookmarks: XBookmark[]): Promise<void> {
    for (const bookmark of bookmarks) {
      if (enhancedUrls.has(bookmark.url)) {
        continue;
      }

      enhancedUrls.add(bookmark.url);
      const enhancedBookmark = await enhanceBookmarkText(bookmark);
      enhancedBookmarks.set(bookmark.url, enhancedBookmark);
      state.bookmarks = state.bookmarks.map((currentBookmark) => (
        currentBookmark.url === bookmark.url ? enhancedBookmark : currentBookmark
      ));
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

    let previousHeight = getPageMetrics().scrollHeight;
    let stableBottomScans = 0;

    while (
      isCurrentRun(runId) &&
      state.isCollecting &&
      state.scrollAttempts < maxScrollAttempts &&
      stableBottomScans < stableBottomScansToStop
    ) {
      const newBookmarks = scan();
      await enhanceNewBookmarks(newBookmarks);
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
      await enhanceNewBookmarks(newBookmarks);
      state.isCollecting = false;
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
    state.isCollecting = false;
  }

  function clearCollection(): void {
    activeRunId = undefined;
    state.bookmarks = [];
    state.isCollecting = false;
    state.lastScanAdded = 0;
    state.runAdded = 0;
    state.scrollAttempts = 0;
    state.idleScans = 0;
    enhancedUrls.clear();
    enhancedBookmarks.clear();
  }

  function resetForNewCollection(): void {
    state.bookmarks = [];
    state.lastScanAdded = 0;
    state.runAdded = 0;
    state.scrollAttempts = 0;
    state.idleScans = 0;
    enhancedUrls.clear();
    enhancedBookmarks.clear();
  }

  function handleMessage(message: unknown): ContentToPopupResponse {
    if (!isBookmarksPage(getLocation())) {
      return { ok: false, errorKey: "openBookmarksError", state };
    }

    switch (messageType(message)) {
      case "GET_STATUS":
        return { ok: true, bookmarks: state.bookmarks, state };

      case "START_COLLECTION":
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
