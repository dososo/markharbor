export interface XBookmarkVideo {
  sourceUrl: string;
  previewImageUrl?: string;
  label?: string;
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
  video?: XBookmarkVideo;
  rawText: string;
}

export interface CollectionState {
  bookmarks: XBookmark[];
  isCollecting: boolean;
  lastScanAdded: number;
  scrollAttempts: number;
  idleScans: number;
}
