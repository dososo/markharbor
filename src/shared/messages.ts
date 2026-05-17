import type { CollectionState, XBookmark, XBookmarkContentBlock } from "./types";

export type ContentErrorKey = "openBookmarksError" | "unknownOperationError";

export type PopupToContentMessage =
  | { type: "GET_STATUS" }
  | { type: "START_COLLECTION"; fullArticleImages?: boolean }
  | { type: "STOP_COLLECTION" }
  | { type: "CLEAR_COLLECTION" };

export type ContentToBackgroundMessage =
  | { type: "GET_RENDERED_DETAIL_TEXT"; bookmark: XBookmark; fullArticleImages?: boolean };

export type ContentToPopupResponse =
  | { ok: true; state: CollectionState }
  | { ok: true; bookmarks: XBookmark[]; state: CollectionState }
  | { ok: false; errorKey: ContentErrorKey; state?: CollectionState };

export type BackgroundToContentResponse =
  | { ok: true; text?: string; contentBlocks?: XBookmarkContentBlock[] }
  | { ok: false; error: string };
