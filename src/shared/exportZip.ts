import JSZip from "jszip";
import { bookmarkFileName, imageFileName, safeFileName } from "./filenames";
import { renderBookmarkMarkdown, renderCombinedMarkdown } from "./markdown";
import type { XBookmark } from "./types";

export interface BuildExportZipOptions {
  bookmarks: XBookmark[];
  includeImages: boolean;
  fetchImage: (url: string) => Promise<Blob | undefined>;
}

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
): Promise<Map<string, string>> {
  const imagePaths = new Map<string, string>();
  const seenUrls = new Set<string>();
  let index = 0;

  for (const bookmark of bookmarks) {
    for (const url of bookmark.imageUrls) {
      if (seenUrls.has(url)) {
        continue;
      }

      seenUrls.add(url);
      index += 1;

      const blob = await fetchOptionalImage(url, fetchImage);
      if (blob) {
        const path = `attachments/x-bookmarks/${imageFileName(url, index)}`;
        zip.file(path, blob);
        imagePaths.set(url, path);
      }
    }
  }

  return imagePaths;
}

export async function buildExportZip(options: BuildExportZipOptions): Promise<Blob> {
  const zip = new JSZip();
  const imagePaths = options.includeImages
    ? await addImages(zip, options.bookmarks, options.fetchImage)
    : new Map<string, string>();

  zip.file("bookmarks.json", JSON.stringify(options.bookmarks, null, 2));
  zip.file("X Bookmarks Export.md", renderCombinedMarkdown(options.bookmarks, imagePaths));

  const usedBookmarkFileNames = new Set<string>();
  for (const bookmark of options.bookmarks) {
    zip.file(bookmarkZipPath(bookmark, usedBookmarkFileNames), renderBookmarkMarkdown(bookmark, imagePaths));
  }

  return zip.generateAsync({ type: "blob" });
}
