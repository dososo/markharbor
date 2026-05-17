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

  it("keeps normal post media images in content blocks after tweet text", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>Alice Zhang</span>
          <span>@alice</span>
          <a href="/alice/status/1234567890">
            <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
          </a>
        </div>
        <div data-testid="tweetText">普通推文正文。</div>
        <img alt="普通推文配图" src="https://pbs.twimg.com/media/example.jpg" />
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0].contentBlocks).toEqual([
      { type: "paragraph", text: "普通推文正文。" },
      { type: "image", url: "https://pbs.twimg.com/media/example.jpg", alt: "普通推文配图" }
    ]);
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

  it("extracts X Article card title and preview when tweet text is empty", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>Jin Chenma</span>
          <span>@jinchenma_ai</span>
          <a href="/jinchenma_ai/status/2054167281241051194">
            <time datetime="2026-05-12T11:50:00.000Z">May 12</time>
          </a>
        </div>
        <div>
          <div data-testid="article-cover-image">
            <span>文章</span>
          </div>
          <div>
            <span>只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味</span>
          </div>
          <div>
            <span>最近线下跟一群朋友聊 AI，发现一件挺有意思的事。大家不是卡在那些花里胡哨的工作流...</span>
          </div>
        </div>
      </article>
    `;

    const bookmarks = parseBookmarksFromDocument(document, "2026-05-16T00:00:00.000Z");

    expect(bookmarks[0]).toMatchObject({
      text: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味\n\n最近线下跟一群朋友聊 AI，发现一件挺有意思的事。大家不是卡在那些花里胡哨的工作流...",
      article: {
        title: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味",
        preview: "最近线下跟一群朋友聊 AI，发现一件挺有意思的事。大家不是卡在那些花里胡哨的工作流..."
      }
    });
  });
});
