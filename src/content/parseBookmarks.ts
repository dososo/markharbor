import type { XBookmark, XBookmarkVideo } from "../shared/types";

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
  const text = textFrom(article.querySelector('[data-testid="tweetText"]'));
  const postedAt = article.querySelector<HTMLTimeElement>("time[datetime]")?.dateTime;
  const url = `https://x.com/${handle}/status/${id}`;
  const video = parseVideo(article, url);

  return {
    id,
    url,
    authorName: parseAuthorName(userSpans, authorHandle),
    authorHandle,
    text,
    postedAt,
    collectedAt,
    imageUrls: parseImageUrls(article),
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

function parseImageUrls(article: HTMLElement): string[] {
  return Array.from(article.querySelectorAll<HTMLImageElement>("img[src]"))
    .map((img) => img.src)
    .filter((src) => {
      const url = new URL(src);

      return url.hostname === "pbs.twimg.com" && url.pathname.startsWith("/media/");
    });
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
