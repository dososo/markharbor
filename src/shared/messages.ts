import type { CollectionState, XBookmark } from "./types";

export type PopupToContentMessage =
  | { type: "GET_STATUS" }
  | { type: "START_COLLECTION" }
  | { type: "STOP_COLLECTION" }
  | { type: "CLEAR_COLLECTION" };

export type ContentToPopupResponse =
  | { ok: true; state: CollectionState }
  | { ok: true; bookmarks: XBookmark[]; state: CollectionState }
  | { ok: false; error: string; state?: CollectionState };
