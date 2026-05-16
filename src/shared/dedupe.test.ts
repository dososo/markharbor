import { describe, expect, it } from "vitest";
import { mergeBookmarks } from "./dedupe";
import type { XBookmark } from "./types";

function bookmark(overrides: Partial<XBookmark>): XBookmark {
  return {
    id: Object.prototype.hasOwnProperty.call(overrides, "id") ? overrides.id : "1",
    url: overrides.url ?? "https://x.com/alice/status/1",
    authorName: overrides.authorName ?? "Alice",
    authorHandle: overrides.authorHandle ?? "@alice",
    text: overrides.text ?? "Example post",
    postedAt: overrides.postedAt,
    collectedAt: overrides.collectedAt ?? "2026-05-16T00:00:00.000Z",
    imageUrls: overrides.imageUrls ?? [],
    video: overrides.video,
    rawText: overrides.rawText ?? "Alice @alice Example post"
  };
}

describe("mergeBookmarks", () => {
  it("deduplicates by id", () => {
    const result = mergeBookmarks(
      [bookmark({ id: "123", text: "old" })],
      [bookmark({ id: "123", text: "new" })]
    );

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("new");
  });

  it("deduplicates by normalized url when id is missing", () => {
    const result = mergeBookmarks(
      [bookmark({ id: undefined, url: "https://x.com/alice/status/123" })],
      [bookmark({ id: undefined, url: "https://x.com/alice/status/123?ref=bookmark#section" })]
    );

    expect(result).toHaveLength(1);
  });

  it("deduplicates when the same normalized url later includes an id", () => {
    const result = mergeBookmarks(
      [bookmark({ id: undefined, url: "https://x.com/alice/status/123?ref=bookmark", text: "old" })],
      [bookmark({ id: "123", url: "https://x.com/alice/status/123#section", text: "new" })]
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("123");
    expect(result[0].text).toBe("new");
  });
});
