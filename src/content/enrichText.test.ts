import { describe, expect, it, vi } from "vitest";
import { enhanceBookmarkText } from "./enrichText";
import type { XBookmark } from "../shared/types";

function bookmark(overrides: Partial<XBookmark> = {}): XBookmark {
  return {
    id: "123",
    url: "https://x.com/alice/status/123",
    authorName: "Alice",
    authorHandle: "@alice",
    text: overrides.text ?? "Long post starts...",
    postedAt: "2026-05-15T12:30:00.000Z",
    collectedAt: "2026-05-16T00:00:00.000Z",
    imageUrls: [],
    rawText: overrides.rawText ?? "raw",
    textSource: "bookmarks-list",
    textEnhancementStatus: "not-needed",
    ...overrides
  };
}

const detailHtml = `
  <main>
    <article data-testid="tweet">
      <div data-testid="User-Name">
        <span>Alice</span>
        <span>@alice</span>
        <a href="/alice/status/123">
          <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
        </a>
      </div>
      <div data-testid="tweetText">Long post starts with the full detail page body that was hidden from the bookmarks list.</div>
    </article>
  </main>
`;

describe("enhanceBookmarkText", () => {
  it("extracts full text from X initial state when detail HTML has no tweet DOM", async () => {
    const enhanced = await enhanceBookmarkText(
      bookmark({ text: "Short preview" }),
      async () => `
        <!doctype html>
        <html>
          <body>
            <div id="react-root"></div>
            <script>
              window.__INITIAL_STATE__={
                "entities":{
                  "tweets":{
                    "entities":{
                      "123":{
                        "id_str":"123",
                        "full_text":"Short preview with full text from hydrated initial state.",
                        "text":"Short preview with full text from hydrated initial state."
                      }
                    }
                  }
                }
              };
            </script>
          </body>
        </html>
      `
    );

    expect(enhanced.text).toBe("Short preview with full text from hydrated initial state.");
    expect(enhanced.textSource).toBe("post-detail");
    expect(enhanced.textEnhancementStatus).toBe("success");
  });

  it("replaces truncated list text with longer text from the X post detail page", async () => {
    const enhanced = await enhanceBookmarkText(
      bookmark(),
      async () => detailHtml
    );

    expect(enhanced.text).toBe("Long post starts with the full detail page body that was hidden from the bookmarks list.");
    expect(enhanced.textSource).toBe("post-detail");
    expect(enhanced.textEnhancementStatus).toBe("success");
  });

  it("prefers rendered X Article detail text when the list only has a preview", async () => {
    const enhanced = await enhanceBookmarkText(
      bookmark({
        text: "Article title\n\nPreview...",
        rawText: "Article title Preview...",
        article: {
          title: "Article title",
          preview: "Preview..."
        }
      }),
      async () => "<html></html>",
      async () => "Article title\n\nFull rendered article body from the detail page."
    );

    expect(enhanced.text).toBe("Article title\n\nFull rendered article body from the detail page.");
    expect(enhanced.textSource).toBe("post-detail");
    expect(enhanced.textEnhancementStatus).toBe("success");
  });

  it("keeps rendered content blocks when X Article detail text is enhanced", async () => {
    const contentBlocks: XBookmark["contentBlocks"] = [
      { type: "heading", level: 2, text: "Article title" },
      { type: "paragraph", text: "Full rendered paragraph." }
    ];
    const enhanced = await enhanceBookmarkText(
      bookmark({
        text: "Article title\n\nPreview...",
        rawText: "Article title Preview...",
        article: {
          title: "Article title",
          preview: "Preview..."
        }
      }),
      async () => "<html></html>",
      async () => ({
        text: "Article title\n\nFull rendered paragraph.",
        contentBlocks
      })
    );

    expect(enhanced.contentBlocks).toEqual(contentBlocks);
  });

  it("keeps rendered content blocks when detail text is not longer but contains ordered body images", async () => {
    const contentBlocks: XBookmark["contentBlocks"] = [
      { type: "heading", level: 2, text: "Article title" },
      { type: "paragraph", text: "Preview." },
      { type: "image", url: "https://pbs.twimg.com/media/body.jpg", alt: "正文配图" }
    ];
    const enhanced = await enhanceBookmarkText(
      bookmark({
        text: "Article title\n\nPreview.",
        rawText: "Article title Preview.",
        article: {
          title: "Article title",
          preview: "Preview."
        },
        contentBlocks: [
          { type: "heading", level: 2, text: "Article title" },
          { type: "paragraph", text: "Preview." }
        ]
      }),
      async () => "<html></html>",
      async () => ({
        text: "Article title\n\nPreview.",
        contentBlocks
      })
    );

    expect(enhanced.text).toBe("Article title\n\nPreview.");
    expect(enhanced.contentBlocks).toEqual(contentBlocks);
    expect(enhanced.textSource).toBe("post-detail");
    expect(enhanced.textEnhancementStatus).toBe("success");
  });

  it("marks detail fetch failures and keeps the list text", async () => {
    const original = bookmark({ text: "Visible list text" });
    const enhanced = await enhanceBookmarkText(
      original,
      async () => {
        throw new Error("network failed");
      }
    );

    expect(enhanced.text).toBe("Visible list text");
    expect(enhanced.textSource).toBe("bookmarks-list");
    expect(enhanced.textEnhancementStatus).toBe("failed");
  });

  it("does not replace list text when the detail page is not better", async () => {
    const original = bookmark({ text: "Already complete text" });
    const enhanced = await enhanceBookmarkText(
      original,
      async () => `
        <article data-testid="tweet">
          <div data-testid="User-Name">
            <span>Alice</span>
            <span>@alice</span>
            <a href="/alice/status/123">
              <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
            </a>
          </div>
          <div data-testid="tweetText">Already complete text</div>
        </article>
      `
    );

    expect(enhanced.text).toBe("Already complete text");
    expect(enhanced.textSource).toBe("bookmarks-list");
    expect(enhanced.textEnhancementStatus).toBe("not-needed");
  });

  it("fetches the original post URL by default", async () => {
    const htmlResponse = new Response(detailHtml, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
    const fetchMock = vi.fn(async () => htmlResponse);
    vi.stubGlobal("fetch", fetchMock);

    try {
      await enhanceBookmarkText(bookmark());
    } finally {
      vi.unstubAllGlobals();
    }

    expect(fetchMock).toHaveBeenCalledWith("https://x.com/alice/status/123", { credentials: "include" });
  });
});
