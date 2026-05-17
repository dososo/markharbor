import { describe, expect, it } from "vitest";
import {
  renderBookmarksCsv,
  renderBookmarksHtml,
  renderExportReport,
  renderLinksText,
  renderMediaManifest
} from "./exportFormats";
import type { ExportReport, ExportedMediaItem, XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread, with comma",
  textSource: "post-detail",
  textEnhancementStatus: "success",
  postedAt: "2026-05-15T12:30:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
  linkCard: {
    url: "https://example.com/article",
    title: "Example article",
    description: "Example description"
  },
  article: {
    title: "X Article title",
    preview: "X Article preview"
  },
  rawText: "raw"
};

describe("export format renderers", () => {
  it("renders a plain text link list", () => {
    expect(renderLinksText([bookmark])).toBe("https://x.com/alice/status/123\n");
    expect(renderLinksText([])).toBe("");
  });

  it("renders bookmarks CSV with escaped values", () => {
    const csv = renderBookmarksCsv([bookmark]);

    expect(csv).toContain("id,url,author_name,author_handle,text,text_source,text_enhancement_status,posted_at,collected_at,image_urls,article_title,article_preview,link_card_url,link_card_title,link_card_description");
    expect(csv).toContain('"Useful thread, with comma"');
    expect(csv).toContain("post-detail,success");
    expect(csv).toContain("X Article title");
    expect(csv).toContain("https://example.com/article");
    expect(csv).toContain("Example description");
  });

  it("renders a browsable HTML export", () => {
    const html = renderBookmarksHtml([bookmark], new Map([[bookmark.imageUrls[0], "attachments/x-bookmarks/123/image-01-example.jpg"]]));

    expect(html).toContain("<title>MarkHarbor Export</title>");
    expect(html).toContain("Alice");
    expect(html).toContain("Useful thread, with comma");
    expect(html).toContain('<figure><img src="attachments/x-bookmarks/123/image-01-example.jpg" alt="" /></figure>');
    expect(html).toContain("https://x.com/alice/status/123");
    expect(html).toContain("https://example.com/article");
    expect(html).toContain("Example description");
    expect(html).toContain("X 文章标题");
    expect(html).toContain("X Article preview");
    expect(html).toContain("正文来源：原帖详情页");
    expect(html).toContain("正文增强：成功");
  });

  it("renders structured body blocks as semantic HTML", () => {
    const bodyImageUrl = "https://pbs.twimg.com/media/body-image.jpg";
    const html = renderBookmarksHtml([{
      ...bookmark,
      text: "Fallback text should not be used when blocks exist",
      contentBlocks: [
        { type: "heading", level: 2, text: "文章标题" },
        { type: "paragraph", text: "第一段正文。" },
        { type: "image", url: bodyImageUrl, alt: "正文配图" },
        { type: "heading", level: 3, text: "小标题" },
        { type: "paragraph", text: "带有 **重点** 的段落。" },
        { type: "list", items: ["要点一", "要点二"] }
      ]
    }], new Map([[bodyImageUrl, "attachments/x-bookmarks/123/image-01-body-image.jpg"]]));

    expect(html).toContain("<h2>文章标题</h2>");
    expect(html).toContain("<p>第一段正文。</p>");
    expect(html).toContain('<figure><img src="attachments/x-bookmarks/123/image-01-body-image.jpg" alt="正文配图" /></figure>');
    expect(html).toContain("<h3>小标题</h3>");
    expect(html).toContain("<p>带有 <strong>重点</strong> 的段落。</p>");
    expect(html).toContain("<ul><li>要点一</li><li>要点二</li></ul>");
    expect(html).not.toContain("Fallback text should not be used when blocks exist");
  });

  it("renders media manifest JSON", () => {
    const mediaItems: ExportedMediaItem[] = [{
      bookmarkId: "123",
      bookmarkUrl: bookmark.url,
      kind: "image",
      originalUrl: bookmark.imageUrls[0],
      localPath: "attachments/x-bookmarks/123/image-01-example.jpg",
      status: "downloaded"
    }];

    expect(renderMediaManifest(mediaItems)).toContain('"status": "downloaded"');
  });

  it("renders export report JSON", () => {
    const report: ExportReport = {
      exportedAt: "2026-05-16T00:00:00.000Z",
      bookmarkCount: 1,
      generatedFileCount: 8,
      mediaDownloadedCount: 1,
      mediaFailedCount: 0,
      videoSkippedCount: 0
    };

    expect(renderExportReport(report)).toContain('"bookmarkCount": 1');
  });
});
