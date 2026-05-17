import type { TextEnhancementStatus, TextSource, XBookmark } from "../shared/types";
import type { BackgroundToContentResponse, ContentToBackgroundMessage } from "../shared/messages";
import { parseBookmarksFromDocument } from "./parseBookmarks";

type DetailHtmlFetcher = (url: string) => Promise<string>;
type RenderedDetailContent = string | { text?: string; contentBlocks?: XBookmark["contentBlocks"] };
type RenderedDetailTextFetcher = (bookmark: XBookmark) => Promise<RenderedDetailContent | undefined>;

function textFromSource(source: TextSource | undefined): TextSource {
  return source ?? "bookmarks-list";
}

function statusFromEnhancement(status: TextEnhancementStatus | undefined): TextEnhancementStatus {
  return status ?? "not-needed";
}

function statusIdFromUrl(url: string): string | undefined {
  const pathname = new URL(url, "https://x.com").pathname;
  const match = pathname.match(/\/status\/(\d+)/);

  return match?.[1];
}

function extractJsonAssignment(html: string, marker: string): unknown {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) {
    return undefined;
  }

  const objectStart = html.indexOf("{", markerIndex + marker.length);
  if (objectStart === -1) {
    return undefined;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = objectStart; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === "\\") {
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return JSON.parse(html.slice(objectStart, index + 1));
      }
    }
  }

  return undefined;
}

function readPath(value: unknown, path: string[]): unknown {
  let current = value;

  for (const key of path) {
    if (typeof current !== "object" || current === null || !(key in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function tweetTextFromInitialState(html: string, bookmark: XBookmark): string | undefined {
  const targetId = bookmark.id ?? statusIdFromUrl(bookmark.url);
  if (!targetId) {
    return undefined;
  }

  try {
    const initialState = extractJsonAssignment(html, "window.__INITIAL_STATE__=");
    const tweet = readPath(initialState, ["entities", "tweets", "entities", targetId]);
    const fullText = readPath(tweet, ["full_text"]);
    const text = readPath(tweet, ["text"]);

    if (typeof fullText === "string" && fullText.trim()) {
      return fullText.trim();
    }

    return typeof text === "string" && text.trim() ? text.trim() : undefined;
  } catch {
    return undefined;
  }
}

function normalizedText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isBetterDetailText(detailText: string, listText: string): boolean {
  const normalizedDetailText = normalizedText(detailText);
  const normalizedListText = normalizedText(listText);

  return normalizedDetailText.length > normalizedListText.length && normalizedDetailText !== normalizedListText;
}

function hasNewBodyImageBlocks(detailBlocks: XBookmark["contentBlocks"], listBlocks: XBookmark["contentBlocks"]): boolean {
  const existingImageUrls = new Set((listBlocks ?? [])
    .filter((block) => block.type === "image")
    .map((block) => block.url));

  return (detailBlocks ?? [])
    .filter((block) => block.type === "image")
    .some((block) => !existingImageUrls.has(block.url));
}

function shouldReadRenderedDetail(bookmark: XBookmark): boolean {
  const text = normalizedText(bookmark.text);

  return !text
    || text.endsWith("...")
    || text.endsWith("…")
    || bookmark.rawText.includes("显示更多")
    || bookmark.article !== undefined;
}

async function fetchRenderedDetailText(bookmark: XBookmark): Promise<RenderedDetailContent | undefined> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return undefined;
  }

  const message: ContentToBackgroundMessage = {
    type: "GET_RENDERED_DETAIL_TEXT",
    bookmark
  };
  const response = await chrome.runtime.sendMessage(message) as BackgroundToContentResponse | undefined;

  return response?.ok ? {
    text: response.text,
    contentBlocks: response.contentBlocks
  } : undefined;
}

async function fetchDetailHtml(url: string): Promise<string> {
  const response = await fetch(url, { credentials: "include" });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.toLowerCase().includes("text/html")) {
    throw new Error("无法读取 X 原帖详情页。");
  }

  return response.text();
}

function parseDetailBookmark(html: string, bookmark: XBookmark): XBookmark | undefined {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const targetId = bookmark.id ?? statusIdFromUrl(bookmark.url);

  return parseBookmarksFromDocument(doc, bookmark.collectedAt)
    .find((candidate) => {
      if (targetId && candidate.id === targetId) {
        return true;
      }

      return candidate.url === bookmark.url;
    });
}

function detailTextFromHtml(html: string, bookmark: XBookmark): string | undefined {
  const hydratedText = tweetTextFromInitialState(html, bookmark);
  if (hydratedText) {
    return hydratedText;
  }

  return parseDetailBookmark(html, bookmark)?.text;
}

function withTextStatus(
  bookmark: XBookmark,
  textSource: TextSource,
  textEnhancementStatus: TextEnhancementStatus
): XBookmark {
  return {
    ...bookmark,
    textSource,
    textEnhancementStatus
  };
}

export async function enhanceBookmarkText(
  bookmark: XBookmark,
  detailHtmlFetcher: DetailHtmlFetcher = fetchDetailHtml,
  renderedDetailTextFetcher: RenderedDetailTextFetcher = fetchRenderedDetailText
): Promise<XBookmark> {
  try {
    const renderedDetailText = shouldReadRenderedDetail(bookmark)
      ? await renderedDetailTextFetcher(bookmark)
      : undefined;

    const renderedText = typeof renderedDetailText === "string" ? renderedDetailText : renderedDetailText?.text;
    const renderedContentBlocks = typeof renderedDetailText === "string" ? undefined : renderedDetailText?.contentBlocks;

    if (renderedText && (
      isBetterDetailText(renderedText, bookmark.text)
      || hasNewBodyImageBlocks(renderedContentBlocks, bookmark.contentBlocks)
    )) {
      return {
        ...bookmark,
        text: renderedText,
        rawText: renderedText,
        contentBlocks: renderedContentBlocks,
        textSource: "post-detail",
        textEnhancementStatus: "success"
      };
    }

    const html = await detailHtmlFetcher(bookmark.url);
    const detailText = detailTextFromHtml(html, bookmark);

    if (detailText && isBetterDetailText(detailText, bookmark.text)) {
      return {
        ...bookmark,
        text: detailText,
        rawText: detailText,
        textSource: "post-detail",
        textEnhancementStatus: "success"
      };
    }

    if (!normalizedText(bookmark.text)) {
      return withTextStatus(bookmark, "bookmarks-list", "failed");
    }

    return withTextStatus(bookmark, textFromSource(bookmark.textSource), statusFromEnhancement(bookmark.textEnhancementStatus));
  } catch {
    return withTextStatus(bookmark, "bookmarks-list", "failed");
  }
}
