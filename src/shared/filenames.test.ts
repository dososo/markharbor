import { describe, expect, it } from "vitest";
import { bookmarkFileName, imageFileName, safeFileName } from "./filenames";
import type { XBookmark } from "./types";

function bookmark(overrides: Partial<XBookmark> = {}): XBookmark {
  return {
    id: overrides.id ?? "123",
    url: overrides.url ?? "https://x.com/a/status/123",
    authorName: overrides.authorName,
    authorHandle: overrides.authorHandle,
    text: overrides.text ?? "A long useful post about tools",
    postedAt: overrides.postedAt,
    collectedAt: overrides.collectedAt ?? "2026-05-16T00:00:00.000Z",
    imageUrls: overrides.imageUrls ?? [],
    video: overrides.video,
    rawText: overrides.rawText ?? ""
  };
}

describe("safeFileName", () => {
  it("removes filesystem-unsafe characters", () => {
    expect(safeFileName('A/B:C*D?"E<F>G|')).toBe("a-b-c-d-e-f-g");
  });

  it("keeps ascii chinese and selected punctuation while normalizing spaces", () => {
    expect(safeFileName(" Alice @作者._ title  with   spaces! ")).toBe("alice-@作者._-title-with-spaces");
  });
});

describe("bookmarkFileName", () => {
  it("uses date author and text", () => {
    expect(bookmarkFileName(bookmark({
      authorName: "Alice",
      authorHandle: "@alice",
      postedAt: "2026-05-15T12:30:00.000Z"
    }))).toBe("2026-05-15-alice-a-long-useful-post-about-tools.md");
  });

  it("falls back to collected date handle and id", () => {
    expect(bookmarkFileName(bookmark({
      id: "abc123",
      authorHandle: "@Alice",
      text: "!!!",
      postedAt: undefined,
      collectedAt: "2026-05-16T00:00:00.000Z"
    }))).toBe("2026-05-16-@alice-abc123.md");
  });
});

describe("imageFileName", () => {
  it("uses the URL pathname filename", () => {
    expect(imageFileName("https://pbs.twimg.com/media/Example.JPG?format=jpg&name=large", 2)).toBe("image-2-example.jpg");
  });

  it("falls back to image index", () => {
    expect(imageFileName("https://pbs.twimg.com/media/", 2)).toBe("image-2.jpg");
  });

  it("disambiguates different URLs with the same basename", () => {
    expect(imageFileName("https://pbs.twimg.com/media/a/example.jpg", 1)).not.toBe(
      imageFileName("https://pbs.twimg.com/media/b/example.jpg", 2)
    );
  });
});
