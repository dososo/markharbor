import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";
import { buildExportZip } from "./exportZip";
import type { XBookmark } from "./types";

function bookmark(overrides: Partial<XBookmark> = {}): XBookmark {
  return {
    id: overrides.id ?? "123",
    url: overrides.url ?? "https://x.com/alice/status/123",
    authorName: overrides.authorName ?? "Alice",
    authorHandle: overrides.authorHandle ?? "@alice",
    text: overrides.text ?? "Useful thread",
    postedAt: overrides.postedAt,
    collectedAt: overrides.collectedAt ?? "2026-05-16T00:00:00.000Z",
    imageUrls: overrides.imageUrls ?? [],
    video: overrides.video,
    rawText: overrides.rawText ?? "raw"
  };
}

describe("buildExportZip", () => {
  it("includes json combined markdown and per-bookmark markdown", async () => {
    const blob = await buildExportZip({
      bookmarks: [bookmark()],
      includeImages: false,
      fetchImage: async () => undefined
    });
    const zip = await JSZip.loadAsync(blob);

    expect(zip.file("bookmarks.json")).toBeTruthy();
    expect(zip.file("X Bookmarks Export.md")).toBeTruthy();
    expect(zip.file("bookmarks/2026-05-16-alice-useful-thread.md")).toBeTruthy();
  });

  it("does not fetch images when image inclusion is disabled", async () => {
    const fetchImage = vi.fn(async () => new Blob(["image"]));

    const blob = await buildExportZip({
      bookmarks: [bookmark({ imageUrls: ["https://pbs.twimg.com/media/example.jpg"] })],
      includeImages: false,
      fetchImage
    });
    const zip = await JSZip.loadAsync(blob);
    const markdown = await zip.file("X Bookmarks Export.md")?.async("string");

    expect(fetchImage).not.toHaveBeenCalled();
    expect(zip.file("attachments/x-bookmarks/image-1-example.jpg")).toBeNull();
    expect(markdown).toContain("![](<https://pbs.twimg.com/media/example.jpg>)");
  });

  it("fetches each unique image once and renders local attachment paths for successful blobs", async () => {
    const imageUrl = "https://pbs.twimg.com/media/example.jpg";
    const missingUrl = "https://pbs.twimg.com/media/missing.jpg";
    const rejectedUrl = "https://pbs.twimg.com/media/rejected.jpg";
    const fetchImage = vi.fn(async (url: string) => {
      if (url === imageUrl) {
        return new Blob(["image-bytes"], { type: "image/jpeg" });
      }

      if (url === rejectedUrl) {
        throw new Error("network failed");
      }

      return undefined;
    });

    const blob = await buildExportZip({
      bookmarks: [
        bookmark({ imageUrls: [imageUrl, missingUrl, rejectedUrl] }),
        bookmark({ id: "456", url: "https://x.com/bob/status/456", imageUrls: [imageUrl, rejectedUrl] })
      ],
      includeImages: true,
      fetchImage
    });
    const zip = await JSZip.loadAsync(blob);
    const combinedMarkdown = await zip.file("X Bookmarks Export.md")?.async("string");
    const attachment = await zip.file("attachments/x-bookmarks/image-1-example.jpg")?.async("string");

    expect(fetchImage).toHaveBeenCalledTimes(3);
    expect(fetchImage).toHaveBeenCalledWith(imageUrl);
    expect(fetchImage).toHaveBeenCalledWith(missingUrl);
    expect(fetchImage).toHaveBeenCalledWith(rejectedUrl);
    expect(attachment).toBe("image-bytes");
    expect(combinedMarkdown).toContain("![](<attachments/x-bookmarks/image-1-example.jpg>)");
    expect(combinedMarkdown).toContain("![](<https://pbs.twimg.com/media/missing.jpg>)");
    expect(combinedMarkdown).toContain("![](<https://pbs.twimg.com/media/rejected.jpg>)");
  });
});
