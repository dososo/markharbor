import type { XBookmark, XBookmarkContentBlock } from "../shared/types";

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
  scripting: {
    executeScript: (injection: chrome.scripting.ScriptInjection<unknown[], RenderedDetailContent | undefined>) => Promise<Array<{ result?: RenderedDetailContent | string }>>;
  };
}

interface FetchRenderedTextOptions {
  chromeApi?: RenderedTextChromeApi;
  delay?: (ms: number) => Promise<void>;
  maxAttempts?: number;
  waitMs?: number;
}

const DEFAULT_MAX_ATTEMPTS = 20;
const DEFAULT_WAIT_MS = 500;

function defaultDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractRenderedDetailContentFromPage(targetId?: string, targetUrl?: string): RenderedDetailContent | undefined {
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

  function articleMatches(article: HTMLElement, id: string | undefined): boolean {
    if (!id) {
      return true;
    }

    return Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .some((link) => link.href.includes(`/status/${id}`) || link.href.includes(`/article/${id}`));
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
  const article = articles.find((candidate) => articleMatches(candidate, targetStatusId)) ?? articles[0];

  if (!article) {
    return undefined;
  }

  const articleReadView = article.querySelector<HTMLElement>('[data-testid="twitterArticleReadView"]')
    ?? document.querySelector<HTMLElement>('[data-testid="twitterArticleReadView"]');
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

  const text = content?.text?.trim();

  return text ? {
    text,
    contentBlocks: content?.contentBlocks,
    isComplete: content?.isComplete
  } : undefined;
}

export function extractRenderedDetailTextFromPage(targetId?: string, targetUrl?: string): string | undefined {
  return extractRenderedDetailContentFromPage(targetId, targetUrl)?.text;
}

export async function fetchRenderedDetailContent(
  bookmark: XBookmark,
  options: FetchRenderedTextOptions = {}
): Promise<RenderedDetailContent | undefined> {
  const chromeApi = options.chromeApi ?? chrome;
  const delay = options.delay ?? defaultDelay;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const waitMs = options.waitMs ?? DEFAULT_WAIT_MS;
  const tab = await chromeApi.tabs.create({
    url: bookmark.url,
    active: false
  });

  if (!tab.id) {
    throw new Error("Created detail tab has no id.");
  }

  try {
    let bestContent: RenderedDetailContent | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await delay(waitMs);
      const [result] = await chromeApi.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractRenderedDetailContentFromPage,
        args: [bookmark.id, bookmark.url]
      });
      const content = candidateFromResult(result?.result);

      if (!content) {
        continue;
      }

      bestContent = content;
      if (!bookmark.article || content.isComplete || attempt === maxAttempts - 1) {
        return {
          text: content.text,
          contentBlocks: content.contentBlocks
        };
      }
    }

    return bestContent ? {
      text: bestContent.text,
      contentBlocks: bestContent.contentBlocks
    } : undefined;
  } finally {
    await chromeApi.tabs.remove(tab.id);
  }
}

export async function fetchRenderedDetailText(
  bookmark: XBookmark,
  options: FetchRenderedTextOptions = {}
): Promise<string | undefined> {
  const content = await fetchRenderedDetailContent(bookmark, options);

  return content?.text;
}
