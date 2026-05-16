import { mergeBookmarks } from "../shared/dedupe";
import type { ContentToPopupResponse } from "../shared/messages";
import type { CollectionState } from "../shared/types";
import { parseBookmarksFromDocument } from "./parseBookmarks";

const MAX_SCROLL_ATTEMPTS = 60;
const MAX_IDLE_SCANS = 3;
const SCAN_DELAY_MS = 1200;

const state: CollectionState = {
  bookmarks: [],
  isCollecting: false,
  lastScanAdded: 0,
  scrollAttempts: 0,
  idleScans: 0
};

let nextRunId = 1;
let activeRunId: number | undefined;

function isBookmarksPage(): boolean {
  return window.location.hostname === "x.com" && window.location.pathname.startsWith("/i/bookmarks");
}

function scan(): void {
  const parsed = parseBookmarksFromDocument(document, new Date().toISOString());
  const previousLength = state.bookmarks.length;
  state.bookmarks = mergeBookmarks(state.bookmarks, parsed);
  state.lastScanAdded = state.bookmarks.length - previousLength;

  if (state.lastScanAdded === 0) {
    state.idleScans += 1;
  } else {
    state.idleScans = 0;
  }
}

function scrollPage(): void {
  window.scrollBy({
    top: window.innerHeight * 0.85,
    behavior: "smooth"
  });
  state.scrollAttempts += 1;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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

  while (
    isCurrentRun(runId) &&
    state.isCollecting &&
    state.scrollAttempts < MAX_SCROLL_ATTEMPTS &&
    state.idleScans < MAX_IDLE_SCANS
  ) {
    scan();
    scrollPage();
    await delay(SCAN_DELAY_MS);
  }

  if (isCurrentRun(runId)) {
    scan();
    state.isCollecting = false;
    activeRunId = undefined;
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
  state.scrollAttempts = 0;
  state.idleScans = 0;
}

function messageType(message: unknown): string | undefined {
  if (typeof message !== "object" || message === null || !("type" in message)) {
    return undefined;
  }

  const type = message.type;

  return typeof type === "string" ? type : undefined;
}

function handleMessage(message: unknown): ContentToPopupResponse {
  if (!isBookmarksPage()) {
    return { ok: false, error: "Open https://x.com/i/bookmarks before collecting.", state };
  }

  switch (messageType(message)) {
    case "GET_STATUS":
      return { ok: true, bookmarks: state.bookmarks, state };

    case "START_COLLECTION":
      if (!state.isCollecting) {
        void collectLoop();
      }

      return { ok: true, bookmarks: state.bookmarks, state };

    case "STOP_COLLECTION":
      stopCollection();
      return { ok: true, bookmarks: state.bookmarks, state };

    case "CLEAR_COLLECTION":
      clearCollection();
      return { ok: true, bookmarks: state.bookmarks, state };

    default:
      return { ok: false, error: "Unknown operation.", state };
  }
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  sendResponse(handleMessage(message));
});
