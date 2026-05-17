export interface XBookmarkVideo {
  sourceUrl: string;
  previewImageUrl?: string;
  label?: string;
}

export interface XBookmarkLinkCard {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export interface XBookmarkArticle {
  title?: string;
  preview?: string;
}

export type XBookmarkContentBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; url: string; alt?: string };

export type TextSource = "bookmarks-list" | "post-detail";
export type TextEnhancementStatus = "not-needed" | "success" | "failed";

export interface XBookmark {
  id?: string;
  url: string;
  authorName?: string;
  authorHandle?: string;
  text: string;
  textSource?: TextSource;
  textEnhancementStatus?: TextEnhancementStatus;
  postedAt?: string;
  collectedAt: string;
  imageUrls: string[];
  linkCard?: XBookmarkLinkCard;
  article?: XBookmarkArticle;
  contentBlocks?: XBookmarkContentBlock[];
  video?: XBookmarkVideo;
  rawText: string;
}

export interface ExportedMediaItem {
  bookmarkId?: string;
  bookmarkUrl: string;
  kind: "image" | "card-image" | "video-preview";
  originalUrl: string;
  localPath?: string;
  status: "downloaded" | "failed" | "remote-only";
}

export interface ExportReport {
  exportedAt: string;
  bookmarkCount: number;
  generatedFileCount: number;
  mediaDownloadedCount: number;
  mediaFailedCount: number;
  videoSkippedCount: number;
}

export interface CollectionState {
  bookmarks: XBookmark[];
  isCollecting: boolean;
  lastScanAdded: number;
  runAdded: number;
  scrollAttempts: number;
  idleScans: number;
  detailEnhancedCount: number;
  detailEnhancementTotal: number;
  currentStage?: "idle" | "scanning" | "enhancing" | "scrolling" | "stopped";
  currentItemTitle?: string;
  currentItemUrl?: string;
}
