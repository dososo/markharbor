import type { XBookmark, XBookmarkContentBlock } from "../shared/types";
import { textFromContentBlocks } from "../shared/contentBlocks";

export interface RenderedDetailContent {
  text: string;
  contentBlocks?: XBookmarkContentBlock[];
  isComplete?: boolean;
}

interface RenderedTextChromeApi {
  tabs: {
    create: (properties: chrome.tabs.CreateProperties) => Promise<{ id?: number }>;
    remove: (tabId: number) => Promise<void>;
  };
  windows?: {
    create: (properties: chrome.windows.CreateData) => Promise<{ id?: number; tabs?: Array<{ id?: number }> } | undefined>;
    remove: (windowId: number) => Promise<void>;
  };
  scripting: {
    executeScript: (injection: chrome.scripting.ScriptInjection<unknown[], RenderedDetailContent | undefined>) => Promise<Array<{ result?: RenderedDetailContent | string }>>;
  };
}

interface FetchRenderedTextOptions {
  chromeApi?: RenderedTextChromeApi;
  delay?: (ms: number) => Promise<void>;
  fullArticleImages?: boolean;
  maxAttempts?: number;
  waitMs?: number;
}

const DEFAULT_MAX_ATTEMPTS = 20;
const DEFAULT_ARTICLE_MAX_ATTEMPTS = 40;
const DEFAULT_WAIT_MS = 500;

interface DetailTarget {
  tabId: number;
  close: () => Promise<void>;
}

function defaultDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractRenderedDetailContentFromPage(targetId?: string, targetUrl?: string, targetTitle?: string): RenderedDetailContent | undefined {
  function normalizedText(value: string | undefined | null): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
  }

  function statusIdFromUrl(url: string | undefined): string | undefined {
    if (!url) {
      return undefined;
    }

    try {
      return new URL(url, "https://x.com").pathname.match(/\/status\/(\d+)/)?.[1];
    } catch {
      return undefined;
    }
  }

  function textFrom(element: Element | undefined | null): string {
    return normalizedText(element?.textContent);
  }

  function pushUniqueBlock(blocks: XBookmarkContentBlock[], seen: Set<string>, block: XBookmarkContentBlock): void {
    const key = blockKey(block);

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    blocks.push(block);
  }

  function blockKey(block: XBookmarkContentBlock): string {
    switch (block.type) {
      case "heading":
      case "paragraph":
        return `${block.type}:${block.text}`;
      case "list":
        return `${block.type}:${block.items.join("|")}`;
      case "image":
        return `${block.type}:${block.url}`;
      default:
        return "";
    }
  }

  function isMetricText(text: string): boolean {
    return /^[\d,.]+([万KMB]|千)?$/.test(text) || /^[\d,.]+(\.\d+)?\s*(views?|查看)$/i.test(text);
  }

  function isNoiseText(text: string): boolean {
    return isMetricText(text) || [
      "显示翻译",
      "查看引用",
      "发布你的回复",
      "相关",
      "文章"
    ].includes(text);
  }

  function elementLooksLikeArticleBody(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize || "0");
    const fontWeight = Number.parseInt(style.fontWeight || "0", 10);

    return fontSize >= 17 || fontWeight >= 700 || element.getAttribute("data-testid") === "twitter-article-title";
  }

  function elementIsHeading(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize || "0");
    const fontWeight = Number.parseInt(style.fontWeight || "0", 10);

    return fontSize >= 24 && fontWeight >= 700;
  }

  function elementIsBoldBody(element: Element): boolean {
    const style = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize || "0");
    const fontWeight = Number.parseInt(style.fontWeight || "0", 10);

    return fontSize < 24 && fontWeight >= 700;
  }

  function bulletItemText(text: string): string | undefined {
    return text.match(/^[•·*-]\s*(.+)$/)?.[1]?.trim();
  }

  function shouldJoinParagraphSegment(previous: string, next: string): boolean {
    const previousText = previous.replace(/\*\*/g, "");
    const nextText = next.replace(/\*\*/g, "");

    return /[，,、：:（(]$/.test(previousText) || /^[。，,.!?！？；;：:）)]/.test(nextText);
  }

  function bodyImageUrl(element: Element): string | undefined {
    const img = element instanceof HTMLImageElement
      ? element
      : element.querySelector<HTMLImageElement>("img[src]");
    const styleImage = Array.from<Element>([element, ...Array.from(element.querySelectorAll("[style]"))])
      .map((candidate) => candidate.getAttribute("style")?.match(/url\(["']?(https:\/\/pbs\.twimg\.com\/media\/[^"')]+)["']?\)/)?.[1])
      .find(Boolean);
    const src = img?.src ?? styleImage;

    if (!src) {
      return undefined;
    }

    try {
      const url = new URL(src);
      return url.hostname === "pbs.twimg.com" && url.pathname.startsWith("/media/")
        ? src
        : undefined;
    } catch {
      return undefined;
    }
  }

  function bodyImageAlt(element: Element): string | undefined {
    if (element instanceof HTMLImageElement) {
      return element.getAttribute("alt") ?? undefined;
    }

    return element.querySelector<HTMLImageElement>("img[alt]")?.getAttribute("alt")
      ?? element.getAttribute("alt")
      ?? undefined;
  }

  function bodyImageBlocks(article: HTMLElement): XBookmarkContentBlock[] {
    const blocks: XBookmarkContentBlock[] = [];

    for (const element of Array.from(article.querySelectorAll('img[src], [data-testid="tweetPhoto"]'))) {
      const url = bodyImageUrl(element);

      if (url) {
        blocks.push({
          type: "image",
          url,
          alt: bodyImageAlt(element)
        });
      }
    }

    return blocks;
  }

  function pageScrollHeight(): number {
    return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  }

  function isPageAtBottom(): boolean {
    return window.scrollY + window.innerHeight >= pageScrollHeight() - 32;
  }

  function scrollDetailPage(): void {
    window.scrollBy({
      top: window.innerHeight * 1.5,
      behavior: "auto"
    });
  }

  function statusIdFromLink(link: HTMLAnchorElement): string | undefined {
    try {
      return new URL(link.href, "https://x.com").pathname.match(/\/status\/(\d+)/)?.[1];
    } catch {
      return undefined;
    }
  }

  function articleIdFromLink(link: HTMLAnchorElement): string | undefined {
    try {
      return new URL(link.href, "https://x.com").pathname.match(/\/article\/(\d+)/)?.[1];
    } catch {
      return undefined;
    }
  }

  function articleContainsTitle(article: HTMLElement, title: string | undefined): boolean {
    const normalizedTitle = normalizedText(title);
    if (!normalizedTitle) {
      return false;
    }

    const articleText = textFrom(article);
    const titlePrefix = normalizedTitle.slice(0, Math.min(60, normalizedTitle.length));

    return articleText.includes(normalizedTitle)
      || (titlePrefix.length >= 16 && articleText.includes(titlePrefix));
  }

  function articleMatches(article: HTMLElement, id: string | undefined, title: string | undefined): boolean {
    if (!id && !normalizedText(title)) {
      return true;
    }

    const timeStatusIds = Array.from(article.querySelectorAll("time"))
      .map((time) => time.closest<HTMLAnchorElement>("a[href]"))
      .filter((link): link is HTMLAnchorElement => Boolean(link))
      .map(statusIdFromLink)
      .filter((value): value is string => Boolean(value));

    if (id && timeStatusIds.length > 0) {
      return timeStatusIds.includes(id);
    }

    if (articleContainsTitle(article, title)) {
      return true;
    }

    return Boolean(id) && Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .some((link) => articleIdFromLink(link) === id);
  }

  function renderedArticleContent(
    article: HTMLElement,
    contentRoot: HTMLElement = article,
    isComplete = false
  ): RenderedDetailContent | undefined {
    const title = textFrom(article.querySelector('[data-testid="twitter-article-title"]'));
    const titleElement = title ? article.querySelector('[data-testid="twitter-article-title"]') : undefined;
    const elements = Array.from(contentRoot.querySelectorAll('span, div[dir], img[src], [data-testid="tweetPhoto"]'));
    const seen = new Set<string>();
    const seenBlocks = new Set<string>();
    const blocks: XBookmarkContentBlock[] = [];
    let paragraphParts: string[] = [];
    let listItems: string[] = [];
    let hasReachedTitle = contentRoot !== article || !titleElement;

    function flushParagraph(): void {
      const text = paragraphParts.join("").trim();
      paragraphParts = [];

      if (text) {
        pushUniqueBlock(blocks, seenBlocks, { type: "paragraph", text });
      }
    }

    function flushList(): void {
      if (listItems.length > 0) {
        pushUniqueBlock(blocks, seenBlocks, { type: "list", items: listItems });
        listItems = [];
      }
    }

    function appendParagraph(text: string, isBold: boolean): void {
      const segment = isBold ? `**${text}**` : text;
      const previous = paragraphParts[paragraphParts.length - 1];

      if (previous && !shouldJoinParagraphSegment(previous, segment)) {
        flushParagraph();
      }

      paragraphParts.push(segment);
    }

    if (title) {
      pushUniqueBlock(blocks, seenBlocks, { type: "heading", level: 2, text: title });
      seen.add(title);
    }

    for (const element of elements) {
      if (element === titleElement || titleElement?.contains(element)) {
        hasReachedTitle = true;
        continue;
      }

      if (!hasReachedTitle || !elementLooksLikeArticleBody(element)) {
        const imageUrl = bodyImageUrl(element);
        if (!hasReachedTitle || !imageUrl) {
          continue;
        }
      }

      const imageUrl = bodyImageUrl(element);
      if (imageUrl) {
        flushParagraph();
        flushList();
        pushUniqueBlock(blocks, seenBlocks, {
          type: "image",
          url: imageUrl,
          alt: bodyImageAlt(element)
        });
        continue;
      }

      const text = textFrom(element);
      if (!text || text === title || isNoiseText(text)) {
        continue;
      }

      if (seen.has(text)) {
        continue;
      }
      seen.add(text);

      const listItem = bulletItemText(text);
      if (listItem) {
        flushParagraph();
        listItems.push(listItem);
        continue;
      }

      flushList();

      if (elementIsHeading(element)) {
        flushParagraph();
        pushUniqueBlock(blocks, seenBlocks, { type: "heading", level: 3, text });
        continue;
      }

      appendParagraph(text, elementIsBoldBody(element));
    }

    flushParagraph();
    flushList();

    return blocks.length > 0 ? {
      text: blocks.map((block) => {
        switch (block.type) {
          case "heading":
          case "paragraph":
            return block.text.replace(/\*\*/g, "");
          case "list":
            return block.items.join("\n");
          case "image":
            return block.alt ?? "";
          default:
            return "";
        }
      }).filter(Boolean).join("\n\n"),
      contentBlocks: blocks,
      isComplete
    } : undefined;
  }

  const targetStatusId = targetId ?? statusIdFromUrl(targetUrl);
  const articles = Array.from(document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'));
  const article = articles.find((candidate) => articleMatches(candidate, targetStatusId, targetTitle))
    ?? (!normalizedText(targetTitle) && articles.length === 1 ? articles[0] : undefined);

  if (!article) {
    return undefined;
  }

  const articleReadView = article.querySelector<HTMLElement>('[data-testid="twitterArticleReadView"]');
  const articleRichText = articleReadView?.querySelector<HTMLElement>('[data-testid="twitterArticleRichTextView"]')
    ?? articleReadView?.querySelector<HTMLElement>('[data-testid="longformRichTextComponent"]');
  if (articleReadView && articleRichText) {
    const isComplete = isPageAtBottom();
    const longformContent = renderedArticleContent(articleReadView, articleRichText, isComplete);
    if (longformContent) {
      if (!isComplete) {
        scrollDetailPage();
      }
      return longformContent;
    }
  }

  const tweetText = textFrom(article.querySelector('[data-testid="tweetText"]'));
  if (tweetText) {
    return {
      text: tweetText,
      contentBlocks: [
        { type: "paragraph", text: tweetText },
        ...bodyImageBlocks(article)
      ]
    };
  }

  return renderedArticleContent(article);
}

function candidateFromResult(content: RenderedDetailContent | string | undefined): RenderedDetailContent | undefined {
  if (typeof content === "string") {
    const text = content.trim();

    return text ? { text } : undefined;
  }

  const contentBlocks = content?.contentBlocks;
  const text = content?.text?.trim() || textFromContentBlocks(contentBlocks);

  return text || contentBlocks?.length ? {
    text,
    contentBlocks,
    isComplete: content?.isComplete
  } : undefined;
}

function contentBlockKey(block: XBookmarkContentBlock): string {
  switch (block.type) {
    case "heading":
      return `${block.type}:${block.level}:${block.text}`;
    case "paragraph":
      return `${block.type}:${block.text}`;
    case "list":
      return `${block.type}:${block.items.join("|")}`;
    case "image":
      return `${block.type}:${block.url}`;
    default:
      return "";
  }
}

function indexContentBlockKeys(blocks: XBookmarkContentBlock[]): Map<string, number> {
  return new Map(blocks.map((block, index) => [contentBlockKey(block), index]));
}

function mergeContentBlocks(
  currentBlocks: XBookmarkContentBlock[] | undefined,
  incomingBlocks: XBookmarkContentBlock[] | undefined
): XBookmarkContentBlock[] | undefined {
  if (!incomingBlocks?.length) {
    return currentBlocks;
  }

  if (!currentBlocks?.length) {
    return [...incomingBlocks];
  }

  const merged = [...currentBlocks];

  for (let incomingIndex = 0; incomingIndex < incomingBlocks.length; incomingIndex += 1) {
    const block = incomingBlocks[incomingIndex];
    const blockKey = contentBlockKey(block);
    let keyIndexes = indexContentBlockKeys(merged);

    if (keyIndexes.has(blockKey)) {
      continue;
    }

    let insertIndex = -1;

    for (let previousIndex = incomingIndex - 1; previousIndex >= 0; previousIndex -= 1) {
      const previousKnownIndex = keyIndexes.get(contentBlockKey(incomingBlocks[previousIndex]));
      if (previousKnownIndex !== undefined) {
        insertIndex = previousKnownIndex + 1;
        break;
      }
    }

    if (insertIndex === -1) {
      for (let nextIndex = incomingIndex + 1; nextIndex < incomingBlocks.length; nextIndex += 1) {
        const nextKnownIndex = keyIndexes.get(contentBlockKey(incomingBlocks[nextIndex]));
        if (nextKnownIndex !== undefined) {
          insertIndex = nextKnownIndex;
          break;
        }
      }
    }

    if (insertIndex === -1) {
      insertIndex = merged.length;
    }

    merged.splice(insertIndex, 0, block);
  }

  return merged;
}

function longerText(first: string | undefined, second: string | undefined): string {
  const safeFirst = first ?? "";
  const safeSecond = second ?? "";

  return safeFirst.length >= safeSecond.length ? safeFirst : safeSecond;
}

function mergeRenderedDetailContent(
  current: RenderedDetailContent | undefined,
  incoming: RenderedDetailContent
): RenderedDetailContent {
  if (!current) {
    return {
      text: incoming.contentBlocks?.length ? textFromContentBlocks(incoming.contentBlocks) : incoming.text,
      contentBlocks: incoming.contentBlocks,
      isComplete: incoming.isComplete
    };
  }

  const contentBlocks = mergeContentBlocks(current.contentBlocks, incoming.contentBlocks);
  const text = contentBlocks?.length
    ? textFromContentBlocks(contentBlocks)
    : longerText(current.text, incoming.text);

  return {
    text,
    contentBlocks,
    isComplete: incoming.isComplete
  };
}

function omitKnownListImages(
  content: RenderedDetailContent,
  imageUrls: string[]
): RenderedDetailContent {
  if (!content.contentBlocks?.length || imageUrls.length === 0) {
    return content;
  }

  const listImageUrls = new Set(imageUrls);
  const contentBlocks = content.contentBlocks.filter((block) => block.type !== "image" || !listImageUrls.has(block.url));

  return {
    text: contentBlocks.length ? textFromContentBlocks(contentBlocks) : content.text,
    contentBlocks,
    isComplete: content.isComplete
  };
}

export function extractRenderedDetailTextFromPage(targetId?: string, targetUrl?: string): string | undefined {
  return extractRenderedDetailContentFromPage(targetId, targetUrl)?.text;
}

async function createDetailTarget(
  bookmark: XBookmark,
  chromeApi: RenderedTextChromeApi,
  useCaptureWindow: boolean
): Promise<DetailTarget> {
  if (useCaptureWindow && chromeApi.windows) {
    const captureWindow = await chromeApi.windows.create({
      url: bookmark.url,
      focused: false,
      type: "popup",
      width: 900,
      height: 900
    });
    const tabId = captureWindow?.tabs?.[0]?.id;

    if (!captureWindow?.id || !tabId) {
      if (captureWindow?.id) {
        await chromeApi.windows.remove(captureWindow.id);
      }
      throw new Error("Created detail capture window has no tab id.");
    }

    return {
      tabId,
      close: () => chromeApi.windows?.remove(captureWindow.id!) ?? Promise.resolve()
    };
  }

  const tab = await chromeApi.tabs.create({
    url: bookmark.url,
    active: false
  });

  if (!tab.id) {
    throw new Error("Created detail tab has no id.");
  }

  return {
    tabId: tab.id,
    close: () => chromeApi.tabs.remove(tab.id!)
  };
}

export async function fetchRenderedDetailContent(
  bookmark: XBookmark,
  options: FetchRenderedTextOptions = {}
): Promise<RenderedDetailContent | undefined> {
  const chromeApi = options.chromeApi ?? chrome;
  const delay = options.delay ?? defaultDelay;
  const maxAttempts = options.maxAttempts ?? (bookmark.article ? DEFAULT_ARTICLE_MAX_ATTEMPTS : DEFAULT_MAX_ATTEMPTS);
  const waitMs = options.waitMs ?? DEFAULT_WAIT_MS;
  const target = await createDetailTarget(
    bookmark,
    chromeApi,
    options.fullArticleImages === true && bookmark.article !== undefined
  );

  try {
    let accumulatedContent: RenderedDetailContent | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await delay(waitMs);
      const [result] = await chromeApi.scripting.executeScript({
        target: { tabId: target.tabId },
        func: extractRenderedDetailContentFromPage,
        args: [bookmark.id, bookmark.url, bookmark.article?.title]
      });
      const content = candidateFromResult(result?.result);

      if (!content) {
        continue;
      }

      if (!bookmark.article) {
        return {
          text: content.text,
          contentBlocks: content.contentBlocks
        };
      }

      const articleContent = omitKnownListImages(content, bookmark.imageUrls);
      accumulatedContent = mergeRenderedDetailContent(accumulatedContent, articleContent);
      if (content.isComplete || attempt === maxAttempts - 1) {
        return {
          text: accumulatedContent.text,
          contentBlocks: accumulatedContent.contentBlocks
        };
      }
    }

    return accumulatedContent ? {
      text: accumulatedContent.text,
      contentBlocks: accumulatedContent.contentBlocks
    } : undefined;
  } finally {
    await target.close();
  }
}

export async function fetchRenderedDetailText(
  bookmark: XBookmark,
  options: FetchRenderedTextOptions = {}
): Promise<string | undefined> {
  const content = await fetchRenderedDetailContent(bookmark, options);

  return content?.text;
}
