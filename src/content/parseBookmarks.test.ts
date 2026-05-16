import { describe, expect, it } from "vitest";
import { parseBookmarksFromDocument } from "./parseBookmarks";
import { xBookmarkCardHtml } from "../test/fixtures/xBookmarkCard";

describe("parseBookmarksFromDocument", () => {
  it("extracts visible bookmark fields from loaded X cards", () => {
    document.body.innerHTML = xBookmarkCardHtml;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks).toHaveLength(2);
    expect(bookmarks[0]).toMatchObject({
      id: "1234567890",
      url: "https://x.com/alice/status/1234567890",
      authorName: "Alice Zhang",
      authorHandle: "@alice",
      text: "Useful thread about local-first tools.",
      postedAt: "2026-05-15T12:30:00.000Z",
      imageUrls: ["https://pbs.twimg.com/media/example.jpg?format=jpg&name=small"]
    });
    expect(bookmarks[1].video?.previewImageUrl).toBe("https://pbs.twimg.com/ext_tw_video_thumb/video.jpg");
  });

  it("parses absolute X status links", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>Alice Zhang</span>
          <span>@alice</span>
        </div>
        <div data-testid="tweetText">Absolute link</div>
        <a href="https://x.com/alice/status/1234567890">View post</a>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks).toHaveLength(1);
    expect(bookmarks[0]).toMatchObject({
      id: "1234567890",
      url: "https://x.com/alice/status/1234567890"
    });
  });
});
