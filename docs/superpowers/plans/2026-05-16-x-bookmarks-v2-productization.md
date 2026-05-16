# X 书签导出器 V2 产品化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前 MVP 升级为产品化 Chrome 插件：导出真正可用的 Obsidian 知识库包，支持可追溯附件、CSV/TXT/HTML、双语 UI、更精致的 popup 和完整 README。

**Architecture:** 保留现有 MV3 架构。content script 继续负责 X Bookmarks DOM 采集；shared modules 负责类型、格式渲染、Markdown、文件名和 zip 打包；popup 只负责用户操作、语言和视觉展示，避免把导出逻辑塞进 UI。

**Tech Stack:** TypeScript, Vite, Manifest V3, Vitest, jsdom fixtures, JSZip, Chrome i18n-compatible locale files.

---

## Locked Decisions

- V2 仍然导出一个 zip 文件。
- Markdown 是 Obsidian 主格式。
- JSON 始终包含，作为无损结构化备份。
- CSV、TXT、HTML 默认进入 zip。
- V2 不做 ENEX、PDF、外部文章全文抓取、X 视频文件下载。
- 附件按书签 ID 分目录。
- popup 支持中文和英文切换。
- 视觉参考 Google I/O 2026 和 Material 3 Expressive，但不复制 Google 品牌素材。

## File Structure

- Modify: `src/shared/types.ts` - add link card and media/export report types.
- Modify: `src/content/parseBookmarks.ts` - parse visible X link cards.
- Modify: `src/test/fixtures/xBookmarkCard.ts` - add fixture with link card and media.
- Modify: `src/content/parseBookmarks.test.ts` - cover link card parsing.
- Create: `src/shared/exportFormats.ts` - render CSV, TXT, HTML, export report, and media manifest JSON.
- Create: `src/shared/exportFormats.test.ts` - unit tests for non-Markdown export files.
- Modify: `src/shared/markdown.ts` - render useful Obsidian notes and index.
- Modify: `src/shared/markdown.test.ts` - cover front matter, index, sections, and media references.
- Modify: `src/shared/exportZip.ts` - package V2 file structure and per-bookmark attachments.
- Modify: `src/shared/exportZip.test.ts` - assert zip contents and media manifest.
- Modify: `src/shared/filenames.ts` - add stable attachment folder and media filename helpers.
- Modify: `src/shared/filenames.test.ts` - cover attachment paths.
- Create: `src/popup/i18n.ts` - app-level zh/en dictionary and language persistence.
- Create: `src/popup/i18n.test.ts` - cover language fallback and labels.
- Modify: `src/popup/main.ts` - add language switch, export option state, and clearer status UI.
- Modify: `src/popup/styles.css` - add expressive compact visual polish.
- Modify: `src/manifest.ts` - use localized name/description and `default_locale`.
- Create: `public/_locales/en/messages.json` - Chrome manifest strings.
- Create: `public/_locales/zh_CN/messages.json` - Chrome manifest strings.
- Modify: `README.md` - complete Chinese README plus English Quick Start.
- Modify: `tasks/todo.md` - track V2 execution and review.

---

### Task 1: Enrich Bookmark Data Model and Parser

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `src/content/parseBookmarks.ts`
- Modify: `src/test/fixtures/xBookmarkCard.ts`
- Modify: `src/content/parseBookmarks.test.ts`

- [ ] **Step 1: Add failing parser test for visible link card metadata**

Update `src/content/parseBookmarks.test.ts` with an assertion against the representative fixture:

```ts
expect(bookmarks[0].linkCard).toEqual({
  url: "https://example.com/article",
  title: "Example article title",
  description: "Example article description",
  imageUrl: "https://pbs.twimg.com/card_img/example.jpg"
});
```

Run:

```bash
npm test -- src/content/parseBookmarks.test.ts
```

Expected: FAIL because `linkCard` does not exist yet.

- [ ] **Step 2: Add link card type**

Update `src/shared/types.ts`:

```ts
export interface XBookmarkLinkCard {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}
```

Then add this property to `XBookmark`:

```ts
linkCard?: XBookmarkLinkCard;
```

- [ ] **Step 3: Add fixture markup with X-style card wrapper**

Update `src/test/fixtures/xBookmarkCard.ts` so the representative article includes:

```html
<div data-testid="card.wrapper">
  <a href="https://example.com/article">
    <img src="https://pbs.twimg.com/card_img/example.jpg" />
    <span>example.com</span>
    <span>Example article title</span>
    <span>Example article description</span>
  </a>
</div>
```

- [ ] **Step 4: Implement conservative card parser**

In `src/content/parseBookmarks.ts`, import `XBookmarkLinkCard` and add:

```ts
function parseLinkCard(article: HTMLElement): XBookmarkLinkCard | undefined {
  const wrapper = article.querySelector<HTMLElement>('[data-testid="card.wrapper"]');
  const anchor = wrapper?.querySelector<HTMLAnchorElement>("a[href]");
  if (!wrapper || !anchor) return undefined;

  const spans = Array.from(wrapper.querySelectorAll("span"))
    .map((span) => textFrom(span))
    .filter(Boolean);
  const imageUrl = wrapper.querySelector<HTMLImageElement>("img[src]")?.src;
  const url = new URL(anchor.getAttribute("href") ?? "", "https://x.com").href;
  const [domain, title, description] = spans;

  return {
    url,
    title: title && title !== domain ? title : undefined,
    description: description && description !== title ? description : undefined,
    imageUrl
  };
}
```

Add this field when returning a bookmark:

```ts
linkCard: parseLinkCard(article),
```

- [ ] **Step 5: Verify parser**

Run:

```bash
npm test -- src/content/parseBookmarks.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/shared/types.ts src/content/parseBookmarks.ts src/test/fixtures/xBookmarkCard.ts src/content/parseBookmarks.test.ts
git commit -m "feat: parse visible link cards"
```

---

### Task 2: Add Export Format Renderers

**Files:**
- Create: `src/shared/exportFormats.ts`
- Create: `src/shared/exportFormats.test.ts`

- [ ] **Step 1: Write failing tests for CSV, TXT, HTML, media manifest, and report**

Create `src/shared/exportFormats.test.ts` with tests asserting:

```ts
expect(renderLinksText([bookmark])).toBe("https://x.com/alice/status/123\n");
expect(renderBookmarksCsv([bookmark])).toContain("url,author_name,author_handle,text,posted_at,collected_at,image_urls,link_card_url,link_card_title");
expect(renderBookmarksHtml([bookmark])).toContain("<title>X Bookmarks Export</title>");
expect(renderExportReport(report)).toContain('"bookmarkCount": 1');
expect(renderMediaManifest(mediaItems)).toContain('"status": "downloaded"');
```

Run:

```bash
npm test -- src/shared/exportFormats.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement export renderer types**

Add these interfaces to `src/shared/types.ts` before implementing the renderer:

```ts
export interface ExportedMediaItem {
  bookmarkId?: string;
  bookmarkUrl: string;
  kind: "image" | "card-image" | "video-preview";
  originalUrl: string;
  localPath?: string;
  status: "downloaded" | "failed" | "remote-only";
}

export interface ExportReport {
  exportedAt: string;
  bookmarkCount: number;
  generatedFileCount: number;
  mediaDownloadedCount: number;
  mediaFailedCount: number;
  videoSkippedCount: number;
}
```

- [ ] **Step 3: Implement CSV, TXT, HTML, manifest, and report renderers**

Create `src/shared/exportFormats.ts` with exported functions:

```ts
export function renderLinksText(bookmarks: XBookmark[]): string;
export function renderBookmarksCsv(bookmarks: XBookmark[]): string;
export function renderBookmarksHtml(bookmarks: XBookmark[]): string;
export function renderMediaManifest(items: ExportedMediaItem[]): string;
export function renderExportReport(report: ExportReport): string;
```

CSV columns must be exactly:

```text
url,author_name,author_handle,text,posted_at,collected_at,image_urls,link_card_url,link_card_title
```

`renderLinksText` outputs one source post URL per line and ends with a newline when non-empty.

`renderBookmarksHtml` escapes HTML and includes title, author, text, source link, and link card URL when available.

`renderMediaManifest` and `renderExportReport` return pretty JSON with two-space indentation.

- [ ] **Step 4: Verify export renderers**

Run:

```bash
npm test -- src/shared/exportFormats.test.ts
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/exportFormats.ts src/shared/exportFormats.test.ts
git commit -m "feat: add portable export formats"
```

---

### Task 3: Upgrade Markdown and Attachment Structure

**Files:**
- Modify: `src/shared/filenames.ts`
- Modify: `src/shared/filenames.test.ts`
- Modify: `src/shared/markdown.ts`
- Modify: `src/shared/markdown.test.ts`

- [ ] **Step 1: Add failing tests for per-bookmark attachment paths**

Update `src/shared/filenames.test.ts` to assert:

```ts
expect(bookmarkAttachmentFolder(bookmark)).toBe("attachments/x-bookmarks/123");
expect(mediaFileName("https://pbs.twimg.com/media/example.jpg", 1)).toBe("image-01-example.jpg");
```

Run:

```bash
npm test -- src/shared/filenames.test.ts
```

Expected: FAIL because helpers do not exist.

- [ ] **Step 2: Add attachment helper functions**

Update `src/shared/filenames.ts` with:

```ts
export function bookmarkAttachmentFolder(bookmark: XBookmark): string {
  const id = safeFileName(bookmark.id ?? "") || safeFileName(bookmark.url).slice(0, 48) || "bookmark";
  return `attachments/x-bookmarks/${id}`;
}

export function mediaFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop();
  const suffix = base ? safeFileName(decodeURIComponent(base)) : "";
  const padded = String(index).padStart(2, "0");
  return suffix ? `image-${padded}-${suffix}` : `image-${padded}.jpg`;
}
```

- [ ] **Step 3: Add failing Markdown tests**

Update `src/shared/markdown.test.ts` to assert the per-bookmark note contains:

```text
title:
bookmark_id:
## 原文
## 链接卡片
## 媒体
## 来源
## 我的笔记
```

Also assert index rendering contains:

```text
# X Bookmarks Index
[[bookmarks/2026-05-16-alice-useful-thread|Alice - Useful thread]]
```

Run:

```bash
npm test -- src/shared/markdown.test.ts
```

Expected: FAIL because current Markdown is too minimal.

- [ ] **Step 4: Implement V2 Markdown renderers**

Update `src/shared/markdown.ts` to export:

```ts
export function renderBookmarkMarkdown(bookmark: XBookmark, imagePaths: Map<string, string>): string;
export function renderIndexMarkdown(bookmarks: XBookmark[], notePaths: Map<string, string>, report: ExportReport): string;
```

`renderBookmarkMarkdown` must add richer YAML fields, a stable heading, `## 原文`, optional `## 链接卡片`, `## 媒体`, `## 来源`, and `## 我的笔记`. Empty body text must render `（未采集到可见正文）`.

`renderIndexMarkdown` must show export time, total bookmarks, media success/failure counts, and links to every note path.

- [ ] **Step 5: Verify Markdown**

Run:

```bash
npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts
npm run typecheck
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/shared/filenames.ts src/shared/filenames.test.ts src/shared/markdown.ts src/shared/markdown.test.ts
git commit -m "feat: render useful obsidian notes"
```

---

### Task 4: Package V2 Zip with Traceable Media

**Files:**
- Modify: `src/shared/exportZip.ts`
- Modify: `src/shared/exportZip.test.ts`

- [ ] **Step 1: Write failing V2 zip tests**

Update `src/shared/exportZip.test.ts` to assert a zip includes:

```text
X Bookmarks Index.md
bookmarks.json
bookmarks.csv
links.txt
bookmarks.html
media-manifest.json
export-report.json
bookmarks/2026-05-16-alice-useful-thread.md
attachments/x-bookmarks/123/image-01-example.jpg
```

Also assert:

```ts
expect(markdown).toContain("![](../attachments/x-bookmarks/123/image-01-example.jpg)");
expect(mediaManifest).toContain('"bookmarkId": "123"');
expect(exportReport).toContain('"bookmarkCount": 1');
```

Run:

```bash
npm test -- src/shared/exportZip.test.ts
```

Expected: FAIL because the current zip still uses MVP names and flat attachments.

- [ ] **Step 2: Implement media collection and report creation**

In `src/shared/exportZip.ts`, build note paths first and store them in a `Map<string, string>` keyed by bookmark URL. Download each bookmark image into its own attachment folder. Include link card image when `bookmark.linkCard.imageUrl` exists. Include video preview image as `remote-only` in `media-manifest.json`; do not download video files. Build `ExportReport` with counts.

- [ ] **Step 3: Add V2 files to zip**

Update `buildExportZip` so it writes:

```ts
zip.file("bookmarks.json", JSON.stringify(options.bookmarks, null, 2));
zip.file("bookmarks.csv", renderBookmarksCsv(options.bookmarks));
zip.file("links.txt", renderLinksText(options.bookmarks));
zip.file("bookmarks.html", renderBookmarksHtml(options.bookmarks));
zip.file("media-manifest.json", renderMediaManifest(mediaItems));
zip.file("export-report.json", renderExportReport(report));
zip.file("X Bookmarks Index.md", renderIndexMarkdown(options.bookmarks, notePaths, report));
```

Keep per-bookmark Markdown under `bookmarks/`.

- [ ] **Step 4: Verify zip package**

Run:

```bash
npm test -- src/shared/exportZip.test.ts
npm test
npm run typecheck
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/shared/exportZip.ts src/shared/exportZip.test.ts
git commit -m "feat: package traceable obsidian export"
```

---

### Task 5: Add Bilingual Popup and Expressive UI

**Files:**
- Create: `src/popup/i18n.ts`
- Create: `src/popup/i18n.test.ts`
- Modify: `src/popup/main.ts`
- Modify: `src/popup/styles.css`
- Modify: `src/manifest.ts`
- Create: `public/_locales/en/messages.json`
- Create: `public/_locales/zh_CN/messages.json`

- [ ] **Step 1: Write failing i18n tests**

Create `src/popup/i18n.test.ts` asserting:

```ts
expect(resolveLanguage("zh-CN")).toBe("zh");
expect(resolveLanguage("en-US")).toBe("en");
expect(t("zh", "startCollection")).toBe("开始采集");
expect(t("en", "startCollection")).toBe("Start collection");
```

Run:

```bash
npm test -- src/popup/i18n.test.ts
```

Expected: FAIL because `i18n.ts` does not exist.

- [ ] **Step 2: Implement popup dictionary**

Create `src/popup/i18n.ts` with:

```ts
export type AppLanguage = "zh" | "en";
export type MessageKey = keyof typeof messages.zh;

export function resolveLanguage(locale: string | undefined): AppLanguage;
export function t(language: AppLanguage, key: MessageKey): string;
export async function loadLanguage(): Promise<AppLanguage>;
export function saveLanguage(language: AppLanguage): void;
```

Use `localStorage` for manual language persistence to avoid adding a new Chrome permission.

- [ ] **Step 3: Add Chrome manifest locale files**

Create `public/_locales/en/messages.json`:

```json
{
  "extName": {
    "message": "X Bookmarks Obsidian Exporter"
  },
  "extDescription": {
    "message": "Export loaded X Bookmarks to Obsidian-friendly Markdown, JSON, CSV, and media files."
  }
}
```

Create `public/_locales/zh_CN/messages.json`:

```json
{
  "extName": {
    "message": "X 书签 Obsidian 导出器"
  },
  "extDescription": {
    "message": "将已加载的 X 书签导出为适合 Obsidian 的 Markdown、JSON、CSV 和媒体文件。"
  }
}
```

Update `src/manifest.ts`:

```ts
name: "__MSG_extName__",
description: "__MSG_extDescription__",
default_locale: "zh_CN",
```

- [ ] **Step 4: Update popup rendering**

Update `src/popup/main.ts` so popup includes language segmented control, clear page status copy, export preview, existing collection actions, and a clearer image attachment checkbox label.

- [ ] **Step 5: Apply expressive compact styling**

Update `src/popup/styles.css` with width around 380px, warm off-white background, Google-inspired blue/green/yellow/red accents without Google branding, header status chip, segmented language control, compact stat cards, and stronger primary export button hierarchy.

- [ ] **Step 6: Verify popup and build**

Run:

```bash
npm test -- src/popup/i18n.test.ts
npm run typecheck
npm run build
test -f dist/_locales/en/messages.json
test -f dist/_locales/zh_CN/messages.json
```

Expected: all commands pass.

- [ ] **Step 7: Commit**

```bash
git add src/popup/i18n.ts src/popup/i18n.test.ts src/popup/main.ts src/popup/styles.css src/manifest.ts public/_locales/en/messages.json public/_locales/zh_CN/messages.json
git commit -m "feat: polish bilingual popup"
```

---

### Task 6: Complete README and User Documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace MVP README with complete V2 README**

README must include these sections:

```markdown
# X 书签 Obsidian 导出器
## 它解决什么问题
## 功能
## 安装
## 使用方式
## 导出包结构
## Obsidian 使用建议
## 支持的导出格式
## 图片和视频说明
## 隐私与权限
## 已知限制
## 本地开发
## 测试
## Chrome Web Store 发布说明
## FAQ
## English Quick Start
```

- [ ] **Step 2: Document privacy and public release boundary**

README must clearly state local-first behavior, no server, no cookie access, no undocumented X API calls, no video downloads, and export completeness depending on what X page has loaded.

- [ ] **Step 3: Verify README**

Run:

```bash
npm run typecheck
npm test
```

Expected: both pass, confirming docs work did not disturb code.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: complete v2 readme"
```

---

### Task 7: Full Verification, Live Browser Test, and Audit

**Files:**
- Modify: `tasks/todo.md`

- [ ] **Step 1: Run automated verification**

Run:

```bash
npm test
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 2: Run security audit**

Run:

```bash
npm audit --audit-level=moderate
```

Expected: record result in `tasks/todo.md`. If Vite/esbuild/Vitest dev dependency findings remain and the fix requires a breaking upgrade, document it instead of applying a breaking upgrade.

- [ ] **Step 3: Live Chrome validation**

Load `dist/` as unpacked extension in Chrome and verify popup opening, Chinese/English switch, start/stop/clear, zip download, V2 files, index links, per-bookmark attachment folders, and `media-manifest.json`.

- [ ] **Step 4: Inspect exported zip**

Verify the exported zip contains:

```text
X Bookmarks Index.md
bookmarks.json
bookmarks.csv
links.txt
bookmarks.html
media-manifest.json
export-report.json
bookmarks/
attachments/x-bookmarks/
```

Do not use recursive delete commands during cleanup. If cleanup is needed, delete only explicit single files or leave the temporary folder in place.

- [ ] **Step 5: Update task review**

Append a V2 review section to `tasks/todo.md` with automated test result, typecheck result, build result, audit result, Chrome live validation result, and known limitations.

- [ ] **Step 6: Commit**

```bash
git add tasks/todo.md
git commit -m "docs: record v2 verification"
```

---

## Self-Review

- Spec coverage: V2 format support, Obsidian usefulness, attachment traceability, competitor insights, visual direction, bilingual UI, README, verification, and audit each map to at least one task.
- Placeholder scan: No implementation step uses open-ended placeholder language.
- Type consistency: `XBookmarkLinkCard`, `ExportedMediaItem`, and `ExportReport` are introduced before use by Markdown, zip, and export format tasks.
- Risk: link card DOM on X may vary. Parser stays conservative and relies only on visible card structure.
