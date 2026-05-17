import { describe, expect, it, vi } from "vitest";
import type { XBookmark } from "../shared/types";
import { extractRenderedDetailContentFromPage, extractRenderedDetailTextFromPage, fetchRenderedDetailText } from "./renderedText";

const bookmark: XBookmark = {
  id: "2054167281241051194",
  url: "https://x.com/jinchenma_ai/status/2054167281241051194",
  authorName: "金尘马",
  authorHandle: "@jinchenma_ai",
  text: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味\n\n最近线下跟一群朋友聊 AI...",
  article: {
    title: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味",
    preview: "最近线下跟一群朋友聊 AI..."
  },
  textSource: "bookmarks-list",
  textEnhancementStatus: "not-needed",
  postedAt: "2026-05-12T11:50:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: [],
  rawText: "raw"
};

describe("rendered X detail text", () => {
  it("extracts full rendered X Article text without author and engagement noise", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>金尘马</span>
          <span>@jinchenma_ai</span>
        </div>
        <div data-testid="twitter-article-title" style="font-size: 34px; font-weight: 800;">
          <span>只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味</span>
        </div>
        <span style="font-size: 13px;">23</span>
        <span style="font-size: 13px;">5.5万</span>
        <span style="font-size: 17px;">最近线下跟一群朋友聊 AI，发现一件挺有意思的事。</span>
        <span style="font-size: 17px;">大家不是卡在那些花里胡哨的工作流，也不是卡在什么 skill、什么 agent 调度。</span>
        <span style="font-size: 26px; font-weight: 800;">一、AI 所谓的「记住你」，到底记的是个啥</span>
        <span style="font-size: 17px;">先说一句最重要的：AI 没有真正的「记得」。</span>
        <a href="/jinchenma_ai/status/2054167281241051194/analytics">5.5万 查看</a>
      </article>
    `;

    const text = extractRenderedDetailTextFromPage(bookmark.id, bookmark.url);

    expect(text).toContain("只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味");
    expect(text).toContain("最近线下跟一群朋友聊 AI，发现一件挺有意思的事。");
    expect(text).toContain("一、AI 所谓的「记住你」，到底记的是个啥");
    expect(text).not.toContain("@jinchenma_ai");
    expect(text).not.toContain("5.5万 查看");
  });

  it("extracts rendered X Article content blocks for Markdown and HTML layout", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="User-Name">
          <span>金尘马</span>
          <span>@jinchenma_ai</span>
        </div>
        <div data-testid="twitter-article-title" style="font-size: 34px; font-weight: 800;">
          <span>只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味</span>
        </div>
        <span style="font-size: 17px;">最近线下跟一群朋友聊 AI，发现一件挺有意思的事。</span>
        <span style="font-size: 26px; font-weight: 800;">一、AI 所谓的「记住你」，到底记的是个啥</span>
        <span style="font-size: 17px;">先说一句最重要的：AI 没有真正的「记得」。</span>
        <span style="font-size: 17px;">• 基本信息：你是谁</span>
        <span style="font-size: 17px;">• 当前项目：正在做什么</span>
        <span style="font-size: 17px;">第一，</span>
        <span style="font-size: 17px; font-weight: 700;">不用每次重新解释自己</span>
        <span style="font-size: 17px;">。你说「帮我改一下这段文案」，它知道你是做什么的。</span>
      </article>
    `;

    const content = extractRenderedDetailContentFromPage(bookmark.id, bookmark.url);

    expect(content?.text).toContain("只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味");
    expect(content?.contentBlocks).toEqual([
      { type: "heading", level: 2, text: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味" },
      { type: "paragraph", text: "最近线下跟一群朋友聊 AI，发现一件挺有意思的事。" },
      { type: "heading", level: 3, text: "一、AI 所谓的「记住你」，到底记的是个啥" },
      { type: "paragraph", text: "先说一句最重要的：AI 没有真正的「记得」。" },
      { type: "list", items: ["基本信息：你是谁", "当前项目：正在做什么"] },
      { type: "paragraph", text: "第一，**不用每次重新解释自己**。你说「帮我改一下这段文案」，它知道你是做什么的。" }
    ]);
  });

  it("extracts X Article body images as ordered content blocks", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="twitter-article-title" style="font-size: 34px; font-weight: 800;">
          <span>图文文章</span>
        </div>
        <span style="font-size: 17px;">图片前正文。</span>
        <a href="/alice/article/123/media/456">
          <img alt="正文配图" src="https://pbs.twimg.com/media/body-image.jpg?format=jpg&name=large" />
        </a>
        <span style="font-size: 17px;">图片后正文。</span>
      </article>
    `;

    const content = extractRenderedDetailContentFromPage("123", "https://x.com/alice/status/123");

    expect(content?.contentBlocks).toEqual([
      { type: "heading", level: 2, text: "图文文章" },
      { type: "paragraph", text: "图片前正文。" },
      { type: "image", url: "https://pbs.twimg.com/media/body-image.jpg?format=jpg&name=large", alt: "正文配图" },
      { type: "paragraph", text: "图片后正文。" }
    ]);
  });

  it("keeps normal post media images in rendered content blocks after tweet text", () => {
    document.body.innerHTML = `
      <article data-testid="tweet">
        <div data-testid="tweetText">普通推文正文。</div>
        <img alt="普通推文配图" src="https://pbs.twimg.com/media/post-image.jpg?format=jpg&name=large" />
      </article>
    `;

    const content = extractRenderedDetailContentFromPage("123", "https://x.com/alice/status/123");

    expect(content?.contentBlocks).toEqual([
      { type: "paragraph", text: "普通推文正文。" },
      { type: "image", url: "https://pbs.twimg.com/media/post-image.jpg?format=jpg&name=large", alt: "普通推文配图" }
    ]);
  });

  it("opens an inactive X detail tab, reads rendered text, and closes the tab", async () => {
    const chromeApi = {
      tabs: {
        create: vi.fn(async () => ({ id: 42 })),
        remove: vi.fn(async () => undefined)
      },
      scripting: {
        executeScript: vi.fn(async () => [{
          result: "只需10分钟，让AI比亲妈都懂你，从此写啥都是你的味\n\n完整正文"
        }])
      }
    };

    const text = await fetchRenderedDetailText(bookmark, {
      chromeApi,
      delay: async () => undefined,
      maxAttempts: 1
    });

    expect(text).toContain("完整正文");
    expect(chromeApi.tabs.create).toHaveBeenCalledWith({
      url: "https://x.com/jinchenma_ai/status/2054167281241051194",
      active: false
    });
    expect(chromeApi.scripting.executeScript).toHaveBeenCalledWith(expect.objectContaining({
      target: { tabId: 42 },
      args: [bookmark.id, bookmark.url]
    }));
    expect(chromeApi.tabs.remove).toHaveBeenCalledWith(42);
  });
});
