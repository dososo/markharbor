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
    expect(bookmarks[0].linkCard).toEqual({
      url: "https://example.com/article",
      title: "Example article title",
      description: "Example article description",
      imageUrl: "https://pbs.twimg.com/card_img/example.jpg"
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

  it("extracts display name from nested user name markup", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>
            <a href="/alice">
              <span>Alice Zhang</span>
            </a>
            <span>@alice</span>
            <a href="/alice/status/1234567890">
              <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
            </a>
          </span>
        </div>
        <div data-testid="tweetText">Nested author</div>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0]).toMatchObject({
      authorName: "Alice Zhang",
      authorHandle: "@alice"
    });
  });

  it("preserves display names containing at signs", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>
            <a href="/alice">
              <span>Alice @ Acme</span>
            </a>
            <span>@alice</span>
            <a href="/alice/status/1234567890">
              <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
            </a>
          </span>
        </div>
        <div data-testid="tweetText">Name contains at sign</div>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0]).toMatchObject({
      authorName: "Alice @ Acme",
      authorHandle: "@alice"
    });
  });

  it("prefers the timestamp permalink over earlier quoted status links", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>Alice Zhang</span>
          <span>@alice</span>
          <a href="/alice/status/1234567890">
            <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
          </a>
        </div>
        <div data-testid="tweetText">Main post with quote</div>
        <div data-testid="quoteTweet">
          <a href="/quoted/status/999">Quoted post</a>
        </div>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0]).toMatchObject({
      id: "1234567890",
      url: "https://x.com/alice/status/1234567890"
    });
  });

  it("does not select an embedded status link before the timestamp permalink", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <a href="/embedded/status/111">Embedded status card</a>
        <div data-testid="User-Name">
          <span>Bob Lee</span>
          <span>@bob</span>
          <a href="/bob/status/222">
            <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
          </a>
        </div>
        <div data-testid="tweetText">Main post with embedded card</div>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0]).toMatchObject({
      id: "222",
      url: "https://x.com/bob/status/222"
    });
  });
});
