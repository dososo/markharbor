import type { XBookmark, XBookmarkArticle, XBookmarkContentBlock, XBookmarkLinkCard, XBookmarkVideo } from "../shared/types";

const STATUS_PATH_PATTERN = /^\/([^/]+)\/status\/(\d+)/;

export function parseBookmarksFromDocument(doc: Document, collectedAt: string): XBookmark[] {
  return Array.from(doc.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'))
    .map((article) => parseBookmarkArticle(article, collectedAt))
    .filter((bookmark): bookmark is XBookmark => bookmark !== undefined);
}

function parseBookmarkArticle(article: HTMLElement, collectedAt: string): XBookmark | undefined {
  const statusLink = findStatusLink(article);

  if (!statusLink) {
    return undefined;
  }

  const { handle, id } = statusLink;
  const userName = article.querySelector<HTMLElement>('[data-testid="User-Name"]');
  const userSpans = Array.from(userName?.querySelectorAll("span") ?? []);
  const authorHandle = textFrom(userSpans.find((span) => textFrom(span).startsWith("@")));
  const articleCard = parseArticleCard(article);
  const text = textFrom(article.querySelector('[data-testid="tweetText"]')) || articleText(articleCard);
  const postedAt = article.querySelector<HTMLTimeElement>("time[datetime]")?.dateTime;
  const url = `https://x.com/${handle}/status/${id}`;
  const video = parseVideo(article, url);
  const images = parseImages(article);

  return {
    id,
    url,
    authorName: parseAuthorName(userSpans, authorHandle),
    authorHandle,
    text,
    textSource: "bookmarks-list",
    textEnhancementStatus: "not-needed",
    postedAt,
    collectedAt,
    imageUrls: images.map((image) => image.url),
    linkCard: parseLinkCard(article),
    article: articleCard,
    contentBlocks: bookmarkContentBlocks(text, articleCard, images),
    video,
    rawText: textFrom(article)
  };
}

function findStatusLink(article: HTMLElement): { handle: string; id: string } | undefined {
  const timestampLink = article.querySelector("time[datetime]")?.closest<HTMLAnchorElement>("a[href]");
  const timestampStatusLink = timestampLink ? parseStatusLinkHref(timestampLink.getAttribute("href")) : undefined;

  if (timestampStatusLink) {
    return timestampStatusLink;
  }

  const links = Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]"));

  for (const link of links) {
    const statusLink = parseStatusLinkHref(link.getAttribute("href"));

    if (statusLink) {
      return statusLink;
    }
  }

  return undefined;
}

function parseStatusLinkHref(href: string | null): { handle: string; id: string } | undefined {
  const match = href ? statusPathFromHref(href).match(STATUS_PATH_PATTERN) : undefined;

  if (!match) {
    return undefined;
  }

  return { handle: match[1], id: match[2] };
}

function statusPathFromHref(href: string): string {
  return new URL(href, "https://x.com").pathname;
}

function parseAuthorName(spans: HTMLSpanElement[], authorHandle: string): string {
  const displayName = spans.find((span) => {
    const text = textFrom(span);

    return text && text !== authorHandle && !span.querySelector("span, time");
  });

  return textFrom(displayName);
}

function parseImages(article: HTMLElement): Array<{ url: string; alt?: string }> {
  const images: Array<{ url: string; alt?: string }> = [];

  for (const img of Array.from(article.querySelectorAll<HTMLImageElement>("img[src]"))) {
    const url = new URL(img.src);

    if (url.hostname === "pbs.twimg.com" && url.pathname.startsWith("/media/")) {
      images.push({ url: img.src, alt: img.getAttribute("alt") ?? undefined });
    }
  }

  return images;
}

function parseLinkCard(article: HTMLElement): XBookmarkLinkCard | undefined {
  const wrapper = article.querySelector<HTMLElement>('[data-testid="card.wrapper"]');
  const anchor = wrapper?.querySelector<HTMLAnchorElement>("a[href]");

  if (!wrapper || !anchor) {
    return undefined;
  }

  const spans = Array.from(wrapper.querySelectorAll("span"))
    .map((span) => textFrom(span))
    .filter(Boolean);
  const imageUrl = wrapper.querySelector<HTMLImageElement>("img[src]")?.src;
  const url = new URL(anchor.getAttribute("href") ?? "", "https://x.com").href;
  const [domain, title, description] = spans;

  return {
    url,
    title: title && title !== domain ? title : undefined,
    description: description && description !== title ? description : undefined,
    imageUrl
  };
}

function parseArticleCard(article: HTMLElement): XBookmarkArticle | undefined {
  const coverImage = article.querySelector<HTMLElement>('[data-testid="article-cover-image"]');
  const wrapper = coverImage?.parentElement;

  if (!wrapper) {
    return undefined;
  }

  const pieces = uniqueTexts(Array.from(wrapper.querySelectorAll("span, div")))
    .filter((text) => text && text !== "文章");
  const [title, preview] = pieces;

  if (!title && !preview) {
    return undefined;
  }

  return { title, preview };
}

function articleText(article: XBookmarkArticle | undefined): string {
  return [article?.title, article?.preview]
    .filter((line): line is string => Boolean(line))
    .join("\n\n");
}

function articleContentBlocks(article: XBookmarkArticle | undefined): XBookmarkContentBlock[] | undefined {
  if (!article) {
    return undefined;
  }

  const blocks: XBookmarkContentBlock[] = [];

  if (article.title) {
    blocks.push({ type: "heading", level: 2, text: article.title });
  }

  if (article.preview) {
    blocks.push({ type: "paragraph", text: article.preview });
  }

  return blocks;
}

function bookmarkContentBlocks(
  text: string,
  article: XBookmarkArticle | undefined,
  images: Array<{ url: string; alt?: string }>
): XBookmarkContentBlock[] | undefined {
  const textBlocks = articleContentBlocks(article) ?? (text ? [{ type: "paragraph" as const, text }] : []);
  const imageBlocks: XBookmarkContentBlock[] = images.map((image) => ({
    type: "image",
    url: image.url,
    alt: image.alt
  }));
  const blocks = [...textBlocks, ...imageBlocks];

  return blocks.length > 0 ? blocks : undefined;
}

function parseVideo(article: HTMLElement, sourceUrl: string): XBookmarkVideo | undefined {
  const previewImageUrl = article.querySelector<HTMLImageElement>('[data-testid="videoPlayer"] img[src]')?.src;

  if (!previewImageUrl) {
    return undefined;
  }

  return {
    sourceUrl,
    previewImageUrl
  };
}

function textFrom(element: Element | undefined | null): string {
  return element?.textContent?.trim() ?? "";
}

function uniqueTexts(elements: Element[]): string[] {
  const seen = new Set<string>();
  const texts: string[] = [];

  for (const element of elements) {
    const text = textFrom(element).replace(/\s+/g, " ");
    if (!text || seen.has(text)) {
      continue;
    }

    seen.add(text);
    texts.push(text);
  }

  return texts;
}
