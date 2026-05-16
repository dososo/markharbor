import JSZip from "jszip";
import { bookmarkFileName, imageFileName } from "./filenames";
import { renderBookmarkMarkdown, renderCombinedMarkdown } from "./markdown";
import type { XBookmark } from "./types";

export interface BuildExportZipOptions {
  bookmarks: XBookmark[];
  includeImages: boolean;
  fetchImage: (url: string) => Promise<Blob | undefined>;
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

      try {
        const blob = await fetchImage(url);
        if (blob) {
          const path = `attachments/x-bookmarks/${imageFileName(url, index)}`;
          zip.file(path, blob);
          imagePaths.set(url, path);
        }
      } catch {
        // Missing attachments intentionally fall back to the original image URL in Markdown.
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

  for (const bookmark of options.bookmarks) {
    zip.file(`bookmarks/${bookmarkFileName(bookmark)}`, renderBookmarkMarkdown(bookmark, imagePaths));
  }

  return zip.generateAsync({ type: "blob" });
}
