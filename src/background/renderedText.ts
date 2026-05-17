import type { XBookmark, XBookmarkContentBlock } from "../shared/types";

export interface RenderedDetailContent {
  text: string;
  contentBlocks?: XBookmarkContentBlock[];
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
    if (!(element instanceof HTMLImageElement)) {
      return undefined;
    }

    try {
      const url = new URL(element.src);
      return url.hostname === "pbs.twimg.com" && url.pathname.startsWith("/media/")
        ? element.src
        : undefined;
    } catch {
      return undefined;
    }
  }

  function bodyImageBlocks(article: HTMLElement): XBookmarkContentBlock[] {
    const blocks: XBookmarkContentBlock[] = [];

    for (const element of Array.from(article.querySelectorAll("img[src]"))) {
      const url = bodyImageUrl(element);

      if (url) {
        blocks.push({
          type: "image",
          url,
          alt: element.getAttribute("alt") ?? undefined
        });
      }
    }

    return blocks;
  }

  function articleMatches(article: HTMLElement, id: string | undefined): boolean {
    if (!id) {
      return true;
    }

    return Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .some((link) => link.href.includes(`/status/${id}`) || link.href.includes(`/article/${id}`));
  }

  function renderedArticleContent(article: HTMLElement): RenderedDetailContent | undefined {
    const title = textFrom(article.querySelector('[data-testid="twitter-article-title"]'));
    const titleElement = title ? article.querySelector('[data-testid="twitter-article-title"]') : undefined;
    const elements = Array.from(article.querySelectorAll("span, div[dir], img[src]"));
    const seen = new Set<string>();
    const seenBlocks = new Set<string>();
    const blocks: XBookmarkContentBlock[] = [];
    let paragraphParts: string[] = [];
    let listItems: string[] = [];
    let hasReachedTitle = !titleElement;

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
          alt: element.getAttribute("alt") ?? undefined
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
      contentBlocks: blocks
    } : undefined;
  }

  const targetStatusId = targetId ?? statusIdFromUrl(targetUrl);
  const articles = Array.from(document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'));
  const article = articles.find((candidate) => articleMatches(candidate, targetStatusId)) ?? articles[0];

  if (!article) {
    return undefined;
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
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await delay(waitMs);
      const [result] = await chromeApi.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractRenderedDetailContentFromPage,
        args: [bookmark.id, bookmark.url]
      });
      const content = result?.result;
      const text = typeof content === "string" ? content.trim() : content?.text?.trim();

      if (text) {
        return {
          text,
          contentBlocks: typeof content === "string" ? undefined : content?.contentBlocks
        };
      }
    }

    return undefined;
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
