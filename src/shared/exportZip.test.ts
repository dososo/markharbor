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
    linkCard: overrides.linkCard,
    video: overrides.video,
    rawText: overrides.rawText ?? "raw"
  };
}

describe("buildExportZip", () => {
  it("includes V2 export files index and per-bookmark markdown", async () => {
    const blob = await buildExportZip({
      bookmarks: [bookmark()],
      includeImages: false,
      fetchImage: async () => undefined
    });
    const zip = await JSZip.loadAsync(blob);

    expect(zip.file("X Bookmarks Index.md")).toBeTruthy();
    expect(zip.file("bookmarks.json")).toBeTruthy();
    expect(zip.file("bookmarks.csv")).toBeTruthy();
    expect(zip.file("links.txt")).toBeTruthy();
    expect(zip.file("bookmarks.html")).toBeTruthy();
    expect(zip.file("media-manifest.json")).toBeTruthy();
    expect(zip.file("export-report.json")).toBeTruthy();
    expect(zip.file("bookmarks/2026-05-16-alice-useful-thread.md")).toBeTruthy();
  });

  it("keeps duplicate per-bookmark filenames as distinct markdown files", async () => {
    const blob = await buildExportZip({
      bookmarks: [
        bookmark({ id: "123", url: "https://x.com/alice/status/123", text: "Useful thread" }),
        bookmark({ id: "456", url: "https://x.com/alice/status/456", text: "Useful thread" })
      ],
      includeImages: false,
      fetchImage: async () => undefined
    });
    const zip = await JSZip.loadAsync(blob);
    const firstMarkdown = await zip.file("bookmarks/2026-05-16-alice-useful-thread.md")?.async("string");
    const secondMarkdown = await zip.file("bookmarks/2026-05-16-alice-useful-thread-456.md")?.async("string");

    expect(firstMarkdown).toContain("x_url: \"https://x.com/alice/status/123\"");
    expect(secondMarkdown).toContain("x_url: \"https://x.com/alice/status/456\"");
    expect(firstMarkdown).toContain("Useful thread");
    expect(secondMarkdown).toContain("Useful thread");
    expect(firstMarkdown).not.toBe(secondMarkdown);
  });

  it("does not fetch images when image inclusion is disabled and keeps remote references", async () => {
    const fetchImage = vi.fn(async () => new Blob(["image"]));

    const blob = await buildExportZip({
      bookmarks: [bookmark({ imageUrls: ["https://pbs.twimg.com/media/example.jpg"] })],
      includeImages: false,
      fetchImage
    });
    const zip = await JSZip.loadAsync(blob);
    const markdown = await zip.file("bookmarks/2026-05-16-alice-useful-thread.md")?.async("string");
    const mediaManifest = await zip.file("media-manifest.json")?.async("string");

    expect(fetchImage).not.toHaveBeenCalled();
    expect(zip.file("attachments/x-bookmarks/123/image-01-example.jpg")).toBeNull();
    expect(markdown).toContain("![](<https://pbs.twimg.com/media/example.jpg>)");
    expect(mediaManifest).toContain('"status": "remote-only"');
  });

  it("downloads images into per-bookmark folders and records media manifest failures", async () => {
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
        bookmark({
          imageUrls: [imageUrl, missingUrl, rejectedUrl],
          linkCard: {
            url: "https://example.com/article",
            title: "Example article",
            imageUrl
          },
          video: {
            sourceUrl: "https://x.com/alice/status/123",
            previewImageUrl: "https://pbs.twimg.com/ext_tw_video_thumb/video.jpg"
          }
        })
      ],
      includeImages: true,
      fetchImage
    });
    const zip = await JSZip.loadAsync(blob);
    const markdown = await zip.file("bookmarks/2026-05-16-alice-useful-thread.md")?.async("string");
    const mediaManifest = await zip.file("media-manifest.json")?.async("string");
    const exportReport = await zip.file("export-report.json")?.async("string");
    const attachment = await zip.file("attachments/x-bookmarks/123/image-01-example.jpg")?.async("string");

    expect(fetchImage).toHaveBeenCalledTimes(3);
    expect(fetchImage).toHaveBeenCalledWith(imageUrl);
    expect(fetchImage).toHaveBeenCalledWith(missingUrl);
    expect(fetchImage).toHaveBeenCalledWith(rejectedUrl);
    expect(attachment).toBe("image-bytes");
    expect(markdown).toContain("![](../attachments/x-bookmarks/123/image-01-example.jpg)");
    expect(markdown).toContain("![](<https://pbs.twimg.com/media/missing.jpg>)");
    expect(markdown).toContain("![](<https://pbs.twimg.com/media/rejected.jpg>)");
    expect(mediaManifest).toContain('"bookmarkId": "123"');
    expect(mediaManifest).toContain('"status": "downloaded"');
    expect(mediaManifest).toContain('"status": "failed"');
    expect(mediaManifest).toContain('"kind": "video-preview"');
    expect(exportReport).toContain('"bookmarkCount": 1');
    expect(exportReport).toContain('"mediaDownloadedCount": 1');
    expect(exportReport).toContain('"mediaFailedCount": 2');
  });

  it("does not treat attachment filename errors as image fetch failures", async () => {
    await expect(buildExportZip({
      bookmarks: [bookmark({ imageUrls: ["not a url"] })],
      includeImages: true,
      fetchImage: async () => new Blob(["image-bytes"])
    })).rejects.toThrow("Invalid URL");
  });
});
