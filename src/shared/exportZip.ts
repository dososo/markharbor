import JSZip from "jszip";
import { bookmarkAttachmentFolder, bookmarkFileName, mediaFileName, safeFileName } from "./filenames";
import {
  renderBookmarksCsv,
  renderBookmarksHtml,
  renderExportReport,
  renderLinksText,
  renderMediaManifest
} from "./exportFormats";
import { renderBookmarkMarkdown, renderIndexMarkdown } from "./markdown";
import type { ExportReport, ExportedMediaItem, XBookmark } from "./types";

export interface BuildExportZipOptions {
  bookmarks: XBookmark[];
  includeImages: boolean;
  fetchImage: (url: string) => Promise<Blob | undefined>;
}

const mediaZipOptions = { unixPermissions: 0o100644 };

function markdownFileNameWithSuffix(fileName: string, suffix: string): string {
  return fileName.endsWith(".md")
    ? `${fileName.slice(0, -3)}-${suffix}.md`
    : `${fileName}-${suffix}`;
}

function bookmarkZipPath(bookmark: XBookmark, usedFileNames: Set<string>): string {
  const fileName = bookmarkFileName(bookmark);
  if (!usedFileNames.has(fileName)) {
    usedFileNames.add(fileName);
    return `bookmarks/${fileName}`;
  }

  const idSuffix = bookmark.id ? safeFileName(bookmark.id) : "";
  let counter = 2;
  let candidate = idSuffix ? markdownFileNameWithSuffix(fileName, idSuffix) : markdownFileNameWithSuffix(fileName, `${counter}`);

  while (usedFileNames.has(candidate)) {
    counter += 1;
    candidate = idSuffix
      ? markdownFileNameWithSuffix(fileName, `${idSuffix}-${counter}`)
      : markdownFileNameWithSuffix(fileName, `${counter}`);
  }

  usedFileNames.add(candidate);
  return `bookmarks/${candidate}`;
}

function buildNotePaths(bookmarks: XBookmark[]): Map<string, string> {
  const usedBookmarkFileNames = new Set<string>();
  const paths = new Map<string, string>();

  for (const bookmark of bookmarks) {
    paths.set(bookmark.url, bookmarkZipPath(bookmark, usedBookmarkFileNames));
  }

  return paths;
}

async function fetchOptionalImage(
  url: string,
  fetchImage: (url: string) => Promise<Blob | undefined>
): Promise<Blob | undefined> {
  try {
    return await fetchImage(url);
  } catch {
    return undefined;
  }
}

async function addImages(
  zip: JSZip,
  bookmarks: XBookmark[],
  fetchImage: (url: string) => Promise<Blob | undefined>
): Promise<{ imagePaths: Map<string, string>; mediaItems: ExportedMediaItem[] }> {
  const imagePaths = new Map<string, string>();
  const mediaItems: ExportedMediaItem[] = [];
  const seenUrls = new Set<string>();

  for (const bookmark of bookmarks) {
    let bookmarkImageIndex = 0;

    for (const url of bookmark.imageUrls) {
      if (seenUrls.has(url)) {
        continue;
      }

      seenUrls.add(url);
      bookmarkImageIndex += 1;
      const path = `${bookmarkAttachmentFolder(bookmark)}/${mediaFileName(url, bookmarkImageIndex)}`;

      const blob = await fetchOptionalImage(url, fetchImage);
      if (blob) {
        zip.file(path, blob, mediaZipOptions);
        imagePaths.set(url, path);
        mediaItems.push({
          bookmarkId: bookmark.id,
          bookmarkUrl: bookmark.url,
          kind: "image",
          originalUrl: url,
          localPath: path,
          status: "downloaded"
        });
      } else {
        mediaItems.push({
          bookmarkId: bookmark.id,
          bookmarkUrl: bookmark.url,
          kind: "image",
          originalUrl: url,
          status: "failed"
        });
      }
    }

    if (bookmark.linkCard?.imageUrl && !seenUrls.has(bookmark.linkCard.imageUrl)) {
      seenUrls.add(bookmark.linkCard.imageUrl);
      bookmarkImageIndex += 1;
      const url = bookmark.linkCard.imageUrl;
      const path = `${bookmarkAttachmentFolder(bookmark)}/${mediaFileName(url, bookmarkImageIndex)}`;
      const blob = await fetchOptionalImage(url, fetchImage);

      if (blob) {
        zip.file(path, blob, mediaZipOptions);
        imagePaths.set(url, path);
        mediaItems.push({
          bookmarkId: bookmark.id,
          bookmarkUrl: bookmark.url,
          kind: "card-image",
          originalUrl: url,
          localPath: path,
          status: "downloaded"
        });
      } else {
        mediaItems.push({
          bookmarkId: bookmark.id,
          bookmarkUrl: bookmark.url,
          kind: "card-image",
          originalUrl: url,
          status: "failed"
        });
      }
    }

    if (bookmark.video?.previewImageUrl) {
      mediaItems.push({
        bookmarkId: bookmark.id,
        bookmarkUrl: bookmark.url,
        kind: "video-preview",
        originalUrl: bookmark.video.previewImageUrl,
        status: "remote-only"
      });
    }
  }

  return { imagePaths, mediaItems };
}

function remoteOnlyMediaItems(bookmarks: XBookmark[]): ExportedMediaItem[] {
  const items: ExportedMediaItem[] = [];
  const seenUrls = new Set<string>();

  for (const bookmark of bookmarks) {
    for (const url of bookmark.imageUrls) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({
          bookmarkId: bookmark.id,
          bookmarkUrl: bookmark.url,
          kind: "image",
          originalUrl: url,
          status: "remote-only"
        });
      }
    }

    if (bookmark.linkCard?.imageUrl && !seenUrls.has(bookmark.linkCard.imageUrl)) {
      seenUrls.add(bookmark.linkCard.imageUrl);
      items.push({
        bookmarkId: bookmark.id,
        bookmarkUrl: bookmark.url,
        kind: "card-image",
        originalUrl: bookmark.linkCard.imageUrl,
        status: "remote-only"
      });
    }

    if (bookmark.video?.previewImageUrl) {
      items.push({
        bookmarkId: bookmark.id,
        bookmarkUrl: bookmark.url,
        kind: "video-preview",
        originalUrl: bookmark.video.previewImageUrl,
        status: "remote-only"
      });
    }
  }

  return items;
}

function buildReport(bookmarks: XBookmark[], mediaItems: ExportedMediaItem[], noteCount: number): ExportReport {
  return {
    exportedAt: new Date().toISOString(),
    bookmarkCount: bookmarks.length,
    generatedFileCount: 7 + noteCount,
    mediaDownloadedCount: mediaItems.filter((item) => item.status === "downloaded").length,
    mediaFailedCount: mediaItems.filter((item) => item.status === "failed").length,
    videoSkippedCount: bookmarks.filter((bookmark) => bookmark.video).length
  };
}

export async function buildExportZip(options: BuildExportZipOptions): Promise<Blob> {
  const zip = new JSZip();
  const notePaths = buildNotePaths(options.bookmarks);
  const { imagePaths, mediaItems } = options.includeImages
    ? await addImages(zip, options.bookmarks, options.fetchImage)
    : { imagePaths: new Map<string, string>(), mediaItems: remoteOnlyMediaItems(options.bookmarks) };
  const report = buildReport(options.bookmarks, mediaItems, notePaths.size);

  zip.file("bookmarks.json", JSON.stringify(options.bookmarks, null, 2));
  zip.file("bookmarks.csv", renderBookmarksCsv(options.bookmarks));
  zip.file("links.txt", renderLinksText(options.bookmarks));
  zip.file("bookmarks.html", renderBookmarksHtml(options.bookmarks));
  zip.file("media-manifest.json", renderMediaManifest(mediaItems));
  zip.file("export-report.json", renderExportReport(report));
  zip.file("X Bookmarks Index.md", renderIndexMarkdown(options.bookmarks, notePaths, report));

  for (const bookmark of options.bookmarks) {
    const notePath = notePaths.get(bookmark.url);
    if (notePath) {
      zip.file(notePath, renderBookmarkMarkdown(bookmark, imagePaths));
    }
  }

  return zip.generateAsync({ type: "blob" });
}
