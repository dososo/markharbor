import type { XBookmark, XBookmarkArticle, XBookmarkLinkCard, XBookmarkVideo } from "./types";

export interface XquikMediaItem {
  type?: "image" | "video" | "link";
  url?: string;
  previewImageUrl?: string;
}

export interface XquikBookmarkInput {
  id?: string;
  tweetId?: string;
  url?: string;
  tweetUrl?: string;
  permalink?: string;
  authorName?: string;
  authorHandle?: string;
  text?: string;
  fullText?: string;
  content?: string;
  createdAt?: string;
  postedAt?: string;
  collectedAt?: string;
  imageUrls?: string[];
  media?: XquikMediaItem[];
  linkCard?: XBookmarkLinkCard;
  article?: XBookmarkArticle;
}

function cleanText(value: string | undefined): string | undefined {
  const text = value?.trim();

  return text ? text : undefined;
}

function firstText(...values: Array<string | undefined>): string {
  return values.map(cleanText).find((value): value is string => Boolean(value)) ?? "";
}

function cleanHandle(value: string | undefined): string | undefined {
  const handle = cleanText(value);
  if (!handle) {
    return undefined;
  }

  return handle.startsWith("@") ? handle : `@${handle}`;
}

function imageUrlsFrom(input: XquikBookmarkInput): string[] {
  const mediaUrls = (input.media ?? [])
    .filter((item) => item.type === "image")
    .map((item) => cleanText(item.url))
    .filter((url): url is string => Boolean(url));

  return [...input.imageUrls ?? [], ...mediaUrls];
}

function videoFrom(input: XquikBookmarkInput): XBookmarkVideo | undefined {
  const video = input.media?.find((item) => item.type === "video" && (item.url || item.previewImageUrl));
  const sourceUrl = cleanText(video?.url ?? video?.previewImageUrl);
  if (!sourceUrl) {
    return undefined;
  }

  const previewImageUrl = cleanText(video?.previewImageUrl);

  return previewImageUrl ? { sourceUrl, previewImageUrl } : { sourceUrl };
}

export function normalizeXquikBookmark(input: XquikBookmarkInput, fallbackCollectedAt = new Date().toISOString()): XBookmark {
  const id = cleanText(input.id ?? input.tweetId);
  const text = firstText(input.text, input.fullText, input.content);
  const url = firstText(input.url, input.tweetUrl, input.permalink) ||
    (id ? `https://x.com/i/web/status/${id}` : "");
  const bookmark: XBookmark = {
    url,
    text,
    textSource: "post-detail",
    textEnhancementStatus: "success",
    collectedAt: cleanText(input.collectedAt) ?? fallbackCollectedAt,
    imageUrls: imageUrlsFrom(input),
    rawText: text
  };
  const authorName = cleanText(input.authorName);
  const authorHandle = cleanHandle(input.authorHandle);
  const postedAt = cleanText(input.postedAt ?? input.createdAt);
  const video = videoFrom(input);

  if (id) {
    bookmark.id = id;
  }

  if (authorName) {
    bookmark.authorName = authorName;
  }

  if (authorHandle) {
    bookmark.authorHandle = authorHandle;
  }

  if (postedAt) {
    bookmark.postedAt = postedAt;
  }

  if (input.linkCard) {
    bookmark.linkCard = input.linkCard;
  }

  if (input.article) {
    bookmark.article = input.article;
  }

  if (video) {
    bookmark.video = video;
  }

  return bookmark;
}

export function normalizeXquikBookmarks(inputs: XquikBookmarkInput[], fallbackCollectedAt?: string): XBookmark[] {
  return inputs
    .map((input) => normalizeXquikBookmark(input, fallbackCollectedAt))
    .filter((bookmark) => bookmark.url || bookmark.text);
}
