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

export interface XBookmark {
  id?: string;
  url: string;
  authorName?: string;
  authorHandle?: string;
  text: string;
  postedAt?: string;
  collectedAt: string;
  imageUrls: string[];
  linkCard?: XBookmarkLinkCard;
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
  scrollAttempts: number;
  idleScans: number;
}
