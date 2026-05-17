# MarkHarbor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Manifest V3 Chrome extension that collects loaded X Bookmarks in-page and exports Obsidian-friendly Markdown, JSON, and image attachments as a local zip package.

**Architecture:** The extension has a popup UI, a content script, and focused shared modules. The content script owns DOM collection and guided scrolling. Shared modules own data types, deduplication, Markdown rendering, filename safety, and zip export so they can be tested without Chrome.

**Tech Stack:** TypeScript, Vite, Manifest V3, Vitest, jsdom test fixtures, JSZip.

---

## Locked Decisions

- Export package format: one zip file.
- Image download behavior: enabled by default, controlled by a popup checkbox.
- Guided scrolling stop condition: stop after 3 consecutive scans with no new bookmarks or 60 scroll attempts, whichever comes first.
- Build tooling: Vite with TypeScript and Vitest.
- First version scope: no server, no cookie access, no undocumented X API calls, no video downloads.

## File Structure

- `package.json`: npm scripts and dependencies.
- `tsconfig.json`: TypeScript configuration for extension and tests.
- `vite.config.ts`: builds popup and content script into `dist/`.
- `vitest.config.ts`: test configuration.
- `index.html`: popup HTML entry.
- `src/manifest.ts`: typed manifest source.
- `src/popup/main.ts`: popup state, user controls, Chrome messaging.
- `src/popup/styles.css`: popup layout.
- `src/content/main.ts`: message listener, page checks, guided collection loop.
- `src/content/parseBookmarks.ts`: DOM parser for loaded X bookmark cards.
- `src/shared/types.ts`: shared bookmark and export types.
- `src/shared/dedupe.ts`: stable bookmark deduplication.
- `src/shared/filenames.ts`: filesystem-safe names.
- `src/shared/markdown.ts`: combined and per-bookmark Markdown rendering.
- `src/shared/exportZip.ts`: zip package generation.
- `src/shared/messages.ts`: typed message contracts.
- `src/test/fixtures/xBookmarkCard.ts`: representative DOM fixtures.
- `src/**/*.test.ts`: focused unit tests.
- `README.md`: local install, privacy position, and usage.

---

### Task 1: Scaffold TypeScript Extension Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/manifest.ts`
- Create: `src/popup/main.ts`
- Create: `src/popup/styles.css`
- Create: `src/content/main.ts`

- [ ] **Step 1: Create project config files**

Create `package.json`:

```json
{
  "name": "markharbor",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "jszip": "^3.10.1"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.270",
    "@types/node": "^20.14.12",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["chrome", "vitest/globals"]
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"]
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts"]
  }
});
```

- [ ] **Step 2: Create Vite build config**

Create `vite.config.ts`:

```ts
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import { manifest } from "./src/manifest";

function writeManifest() {
  return {
    name: "write-manifest",
    closeBundle() {
      mkdirSync("dist", { recursive: true });
      writeFileSync("dist/manifest.json", JSON.stringify(manifest, null, 2));
    }
  };
}

export default defineConfig({
  plugins: [writeManifest()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
        content: resolve(__dirname, "src/content/main.ts")
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
```

- [ ] **Step 3: Create extension manifest and placeholder entries**

Create `src/manifest.ts`:

```ts
export const manifest = {
  manifest_version: 3,
  name: "MarkHarbor",
  version: "0.1.0",
  description: "Export loaded X Bookmarks into Obsidian-friendly Markdown and JSON.",
  action: {
    default_title: "MarkHarbor",
    default_popup: "index.html"
  },
  permissions: ["activeTab", "downloads"],
  host_permissions: ["https://x.com/*"],
  content_scripts: [
    {
      matches: ["https://x.com/i/bookmarks*"],
      js: ["assets/content.js"],
      run_at: "document_idle"
    }
  ]
} as const;
```

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MarkHarbor</title>
    <script type="module" src="/src/popup/main.ts"></script>
  </head>
  <body>
    <main id="app"></main>
  </body>
</html>
```

Create `src/popup/main.ts`:

```ts
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (root) {
  root.innerHTML = `
    <section class="panel">
      <h1>MarkHarbor</h1>
      <p class="muted">打开 X Bookmarks 页面后开始采集。</p>
      <button type="button" disabled>开始采集</button>
    </section>
  `;
}
```

Create `src/popup/styles.css`:

```css
body {
  width: 320px;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  background: #ffffff;
}

.panel {
  padding: 16px;
}

h1 {
  margin: 0 0 8px;
  font-size: 18px;
}

.muted {
  color: #6b7280;
  font-size: 13px;
}
```

Create `src/content/main.ts`:

```ts
console.info("MarkHarbor content script loaded.");
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 5: Build and typecheck**

Run: `npm run typecheck && npm run build`

Expected: both commands pass and `dist/manifest.json` exists.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src/manifest.ts src/popup/main.ts src/popup/styles.css src/content/main.ts
git commit -m "chore: scaffold chrome extension project"
```

---

### Task 2: Define Shared Data Types and Deduplication

**Files:**
- Create: `src/shared/types.ts`
- Create: `src/shared/dedupe.ts`
- Create: `src/shared/dedupe.test.ts`

- [ ] **Step 1: Write failing dedupe tests**

Create `src/shared/dedupe.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mergeBookmarks } from "./dedupe";
import type { XBookmark } from "./types";

function bookmark(overrides: Partial<XBookmark>): XBookmark {
  return {
    id: overrides.id ?? "1",
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
      [bookmark({ id: undefined, url: "https://x.com/alice/status/123?ref=bookmark" })]
    );

    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/dedupe.test.ts`

Expected: FAIL because `src/shared/dedupe.ts` and `src/shared/types.ts` do not exist.

- [ ] **Step 3: Implement shared types and dedupe**

Create `src/shared/types.ts`:

```ts
export interface XBookmarkVideo {
  sourceUrl: string;
  previewImageUrl?: string;
  label?: string;
}

export interface XBookmark {
  id?: string;
  url: string;
  authorName?: string;
  authorHandle?: string;
  text: string;
  postedAt?: string;
  collectedAt: string;
  imageUrls: string[];
  video?: XBookmarkVideo;
  rawText: string;
}

export interface CollectionState {
  bookmarks: XBookmark[];
  isCollecting: boolean;
  lastScanAdded: number;
  scrollAttempts: number;
  idleScans: number;
}
```

Create `src/shared/dedupe.ts`:

```ts
import type { XBookmark } from "./types";

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0].split("#")[0];
  }
}

function keyFor(bookmark: XBookmark): string {
  return bookmark.id ? `id:${bookmark.id}` : `url:${normalizeUrl(bookmark.url)}`;
}

export function mergeBookmarks(existing: XBookmark[], incoming: XBookmark[]): XBookmark[] {
  const byKey = new Map<string, XBookmark>();

  for (const bookmark of existing) {
    byKey.set(keyFor(bookmark), bookmark);
  }

  for (const bookmark of incoming) {
    byKey.set(keyFor(bookmark), bookmark);
  }

  return Array.from(byKey.values());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/shared/dedupe.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/dedupe.ts src/shared/dedupe.test.ts
git commit -m "feat: add bookmark types and dedupe"
```

---

### Task 3: Implement DOM Bookmark Parser

**Files:**
- Create: `src/test/fixtures/xBookmarkCard.ts`
- Create: `src/content/parseBookmarks.ts`
- Create: `src/content/parseBookmarks.test.ts`

- [ ] **Step 1: Write parser fixture and failing tests**

Create `src/test/fixtures/xBookmarkCard.ts`:

```ts
export const xBookmarkCardHtml = `
  <main>
    <article data-testid="tweet">
      <div data-testid="User-Name">
        <span>Alice Zhang</span>
        <span>@alice</span>
        <time datetime="2026-05-15T12:30:00.000Z">May 15</time>
      </div>
      <div data-testid="tweetText">Useful thread about local-first tools.</div>
      <a href="/alice/status/1234567890">View post</a>
      <img alt="Image" src="https://pbs.twimg.com/media/example.jpg?format=jpg&name=small" />
    </article>
    <article data-testid="tweet">
      <div data-testid="User-Name">
        <span>Bob Lee</span>
        <span>@bob</span>
      </div>
      <div data-testid="tweetText">Video note</div>
      <a href="/bob/status/222">View post</a>
      <div data-testid="videoPlayer">
        <img src="https://pbs.twimg.com/ext_tw_video_thumb/video.jpg" />
      </div>
    </article>
  </main>
`;
```

Create `src/content/parseBookmarks.test.ts`:

```ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/content/parseBookmarks.test.ts`

Expected: FAIL because `parseBookmarksFromDocument` is not implemented.

- [ ] **Step 3: Implement parser**

Create `src/content/parseBookmarks.ts`:

```ts
import type { XBookmark } from "../shared/types";

const STATUS_PATH = /\/([^/]+)\/status\/(\d+)/;

function absoluteXUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://x.com${path}`;
}

function findStatusLink(article: Element): HTMLAnchorElement | undefined {
  return Array.from(article.querySelectorAll<HTMLAnchorElement>("a[href]")).find((link) =>
    STATUS_PATH.test(link.getAttribute("href") ?? "")
  );
}

function parseStatus(url: string): { id?: string; url: string } {
  const absolute = absoluteXUrl(url);
  const match = absolute.match(STATUS_PATH);
  return { id: match?.[2], url: match ? `https://x.com/${match[1]}/status/${match[2]}` : absolute };
}

function textFrom(selector: string, root: Element): string | undefined {
  const value = root.querySelector(selector)?.textContent?.trim();
  return value || undefined;
}

function parseAuthor(article: Element): { authorName?: string; authorHandle?: string } {
  const userName = article.querySelector('[data-testid="User-Name"]');
  const spans = userName ? Array.from(userName.querySelectorAll("span")) : [];
  const authorHandle = spans.map((span) => span.textContent?.trim()).find((text) => text?.startsWith("@"));
  const authorName = spans.map((span) => span.textContent?.trim()).find((text) => text && !text.startsWith("@"));
  return { authorName, authorHandle };
}

function parseImages(article: Element): string[] {
  return Array.from(article.querySelectorAll<HTMLImageElement>("img[src]"))
    .map((img) => img.src)
    .filter((src) => src.includes("pbs.twimg.com/media"));
}

function parseVideo(article: Element, sourceUrl: string): XBookmark["video"] {
  const videoRoot = article.querySelector('[data-testid="videoPlayer"]');
  if (!videoRoot) return undefined;
  const previewImageUrl = videoRoot.querySelector<HTMLImageElement>("img[src]")?.src;
  return { sourceUrl, previewImageUrl, label: "Video on X" };
}

export function parseBookmarksFromDocument(doc: Document, collectedAt: string): XBookmark[] {
  const articles = Array.from(doc.querySelectorAll("article"));

  return articles.flatMap((article) => {
    const statusLink = findStatusLink(article);
    if (!statusLink) return [];

    const status = parseStatus(statusLink.getAttribute("href") ?? statusLink.href);
    const author = parseAuthor(article);
    const text = textFrom('[data-testid="tweetText"]', article) ?? "";
    const postedAt = article.querySelector<HTMLTimeElement>("time[datetime]")?.dateTime;

    return [
      {
        id: status.id,
        url: status.url,
        authorName: author.authorName,
        authorHandle: author.authorHandle,
        text,
        postedAt,
        collectedAt,
        imageUrls: parseImages(article),
        video: parseVideo(article, status.url),
        rawText: article.textContent?.trim() ?? ""
      }
    ];
  });
}
```

- [ ] **Step 4: Run parser tests**

Run: `npm test -- src/content/parseBookmarks.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/test/fixtures/xBookmarkCard.ts src/content/parseBookmarks.ts src/content/parseBookmarks.test.ts
git commit -m "feat: parse loaded x bookmark cards"
```

---

### Task 4: Implement Markdown and Filename Rendering

**Files:**
- Create: `src/shared/filenames.ts`
- Create: `src/shared/filenames.test.ts`
- Create: `src/shared/markdown.ts`
- Create: `src/shared/markdown.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/shared/filenames.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { bookmarkFileName, safeFileName } from "./filenames";

describe("safeFileName", () => {
  it("removes filesystem-unsafe characters", () => {
    expect(safeFileName('A/B:C*D?"E<F>G|')).toBe("A-B-C-D-E-F-G");
  });
});

describe("bookmarkFileName", () => {
  it("uses date author and text", () => {
    expect(bookmarkFileName({
      id: "123",
      url: "https://x.com/a/status/123",
      authorName: "Alice",
      authorHandle: "@alice",
      text: "A long useful post about tools",
      postedAt: "2026-05-15T12:30:00.000Z",
      collectedAt: "2026-05-16T00:00:00.000Z",
      imageUrls: [],
      rawText: ""
    })).toBe("2026-05-15-alice-a-long-useful-post-about-tools.md");
  });
});
```

Create `src/shared/markdown.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderCombinedMarkdown, renderBookmarkMarkdown } from "./markdown";
import type { XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread",
  postedAt: "2026-05-15T12:30:00.000Z",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: ["https://pbs.twimg.com/media/example.jpg"],
  video: { sourceUrl: "https://x.com/alice/status/123", previewImageUrl: "https://pbs.twimg.com/thumb.jpg" },
  rawText: "raw"
};

describe("renderCombinedMarkdown", () => {
  it("renders source link text and local image references", () => {
    const markdown = renderCombinedMarkdown([bookmark], new Map([[bookmark.imageUrls[0], "attachments/x-bookmarks/example.jpg"]]));

    expect(markdown).toContain("# MarkHarbor Export");
    expect(markdown).toContain("[原帖](https://x.com/alice/status/123)");
    expect(markdown).toContain("![](attachments/x-bookmarks/example.jpg)");
    expect(markdown).toContain("视频： https://x.com/alice/status/123");
  });
});

describe("renderBookmarkMarkdown", () => {
  it("renders front matter and body", () => {
    const markdown = renderBookmarkMarkdown(bookmark, new Map());

    expect(markdown).toContain("source: x-bookmarks");
    expect(markdown).toContain('url: "https://x.com/alice/status/123"');
    expect(markdown).toContain("Useful thread");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts`

Expected: FAIL because rendering modules are missing.

- [ ] **Step 3: Implement filenames and Markdown**

Create `src/shared/filenames.ts`:

```ts
import type { XBookmark } from "./types";

export function safeFileName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5@._ -]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function bookmarkFileName(bookmark: XBookmark): string {
  const date = (bookmark.postedAt ?? bookmark.collectedAt).slice(0, 10);
  const author = safeFileName(bookmark.authorName ?? bookmark.authorHandle ?? "unknown");
  const title = safeFileName(bookmark.text).slice(0, 60) || bookmark.id || "bookmark";
  return `${date}-${author}-${title}.md`;
}

export function imageFileName(url: string, index: number): string {
  const parsed = new URL(url);
  const base = parsed.pathname.split("/").pop() || `image-${index}`;
  return safeFileName(base) || `image-${index}.jpg`;
}
```

Create `src/shared/markdown.ts`:

```ts
import type { XBookmark } from "./types";

function escapeYaml(value: string | undefined): string {
  return `"${(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function imageLines(bookmark: XBookmark, imagePaths: Map<string, string>): string[] {
  return bookmark.imageUrls.map((url) => `![](${imagePaths.get(url) ?? url})`);
}

function videoLines(bookmark: XBookmark): string[] {
  if (!bookmark.video) return [];
  const lines = [`视频： ${bookmark.video.sourceUrl}`];
  if (bookmark.video.previewImageUrl) lines.push(`视频预览： ${bookmark.video.previewImageUrl}`);
  return lines;
}

function bookmarkBody(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  return [
    bookmark.text,
    "",
    `[原帖](${bookmark.url})`,
    bookmark.postedAt ? `发布时间： ${bookmark.postedAt}` : undefined,
    ...imageLines(bookmark, imagePaths),
    ...videoLines(bookmark)
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function renderCombinedMarkdown(bookmarks: XBookmark[], imagePaths: Map<string, string>): string {
  const sections = bookmarks.map((bookmark, index) => {
    const title = bookmark.authorName ?? bookmark.authorHandle ?? `Bookmark ${index + 1}`;
    return `## ${title}\n\n${bookmarkBody(bookmark, imagePaths)}`;
  });

  return [`# MarkHarbor Export`, "", ...sections].join("\n");
}

export function renderBookmarkMarkdown(bookmark: XBookmark, imagePaths: Map<string, string>): string {
  return [
    "---",
    "source: x-bookmarks",
    `url: ${escapeYaml(bookmark.url)}`,
    `author: ${escapeYaml(bookmark.authorName)}`,
    `handle: ${escapeYaml(bookmark.authorHandle)}`,
    `collected_at: ${escapeYaml(bookmark.collectedAt)}`,
    "tags:",
    "  - x-bookmarks",
    "---",
    "",
    bookmarkBody(bookmark, imagePaths)
  ].join("\n");
}
```

- [ ] **Step 4: Run rendering tests**

Run: `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/filenames.ts src/shared/filenames.test.ts src/shared/markdown.ts src/shared/markdown.test.ts
git commit -m "feat: render obsidian markdown exports"
```

---

### Task 5: Implement Zip Export

**Files:**
- Create: `src/shared/exportZip.ts`
- Create: `src/shared/exportZip.test.ts`

- [ ] **Step 1: Write failing zip export test**

Create `src/shared/exportZip.test.ts`:

```ts
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildExportZip } from "./exportZip";
import type { XBookmark } from "./types";

const bookmark: XBookmark = {
  id: "123",
  url: "https://x.com/alice/status/123",
  authorName: "Alice",
  authorHandle: "@alice",
  text: "Useful thread",
  collectedAt: "2026-05-16T00:00:00.000Z",
  imageUrls: [],
  rawText: "raw"
};

describe("buildExportZip", () => {
  it("includes json combined markdown and per-bookmark markdown", async () => {
    const blob = await buildExportZip({
      bookmarks: [bookmark],
      includeImages: false,
      fetchImage: async () => undefined
    });
    const zip = await JSZip.loadAsync(blob);

    expect(zip.file("bookmarks.json")).toBeTruthy();
    expect(zip.file("MarkHarbor Export.md")).toBeTruthy();
    expect(zip.file("bookmarks/2026-05-16-alice-useful-thread.md")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/shared/exportZip.test.ts`

Expected: FAIL because `buildExportZip` is missing.

- [ ] **Step 3: Implement zip export**

Create `src/shared/exportZip.ts`:

```ts
import JSZip from "jszip";
import { bookmarkFileName, imageFileName } from "./filenames";
import { renderBookmarkMarkdown, renderCombinedMarkdown } from "./markdown";
import type { XBookmark } from "./types";

export interface BuildExportZipOptions {
  bookmarks: XBookmark[];
  includeImages: boolean;
  fetchImage: (url: string) => Promise<Blob | undefined>;
}

async function addImages(zip: JSZip, bookmarks: XBookmark[], fetchImage: (url: string) => Promise<Blob | undefined>) {
  const imagePaths = new Map<string, string>();
  let index = 0;

  for (const bookmark of bookmarks) {
    for (const url of bookmark.imageUrls) {
      if (imagePaths.has(url)) continue;
      index += 1;
      const path = `attachments/x-bookmarks/${imageFileName(url, index)}`;
      const blob = await fetchImage(url);
      if (blob) {
        zip.file(path, blob);
        imagePaths.set(url, path);
      }
    }
  }

  return imagePaths;
}

export async function buildExportZip(options: BuildExportZipOptions): Promise<Blob> {
  const zip = new JSZip();
  const imagePaths = options.includeImages
    ? await addImages(zip, options.bookmarks, options.fetchImage)
    : new Map<string, string>();

  zip.file("bookmarks.json", JSON.stringify(options.bookmarks, null, 2));
  zip.file("MarkHarbor Export.md", renderCombinedMarkdown(options.bookmarks, imagePaths));

  for (const bookmark of options.bookmarks) {
    zip.file(`bookmarks/${bookmarkFileName(bookmark)}`, renderBookmarkMarkdown(bookmark, imagePaths));
  }

  return zip.generateAsync({ type: "blob" });
}
```

- [ ] **Step 4: Run zip test**

Run: `npm test -- src/shared/exportZip.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/exportZip.ts src/shared/exportZip.test.ts
git commit -m "feat: build local export zip"
```

---

### Task 6: Implement Content Script Collection Loop

**Files:**
- Create: `src/shared/messages.ts`
- Modify: `src/content/main.ts`

- [ ] **Step 1: Define message contracts**

Create `src/shared/messages.ts`:

```ts
import type { CollectionState, XBookmark } from "./types";

export type PopupToContentMessage =
  | { type: "GET_STATUS" }
  | { type: "START_COLLECTION" }
  | { type: "STOP_COLLECTION" }
  | { type: "CLEAR_COLLECTION" };

export type ContentToPopupResponse =
  | { ok: true; state: CollectionState }
  | { ok: true; bookmarks: XBookmark[]; state: CollectionState }
  | { ok: false; error: string; state?: CollectionState };
```

- [ ] **Step 2: Replace placeholder content script**

Modify `src/content/main.ts` to:

```ts
import { parseBookmarksFromDocument } from "./parseBookmarks";
import { mergeBookmarks } from "../shared/dedupe";
import type { PopupToContentMessage } from "../shared/messages";
import type { CollectionState, XBookmark } from "../shared/types";

const MAX_SCROLL_ATTEMPTS = 60;
const MAX_IDLE_SCANS = 3;
const SCAN_DELAY_MS = 1200;

let state: CollectionState = {
  bookmarks: [],
  isCollecting: false,
  lastScanAdded: 0,
  scrollAttempts: 0,
  idleScans: 0
};

function isBookmarksPage(): boolean {
  return location.hostname === "x.com" && location.pathname.startsWith("/i/bookmarks");
}

function scan(): void {
  const found = parseBookmarksFromDocument(document, new Date().toISOString());
  const merged = mergeBookmarks(state.bookmarks, found);
  const added = merged.length - state.bookmarks.length;
  state = {
    ...state,
    bookmarks: merged,
    lastScanAdded: added,
    idleScans: added === 0 ? state.idleScans + 1 : 0
  };
}

async function collectLoop(): Promise<void> {
  state = { ...state, isCollecting: true, idleScans: 0, scrollAttempts: 0 };

  while (state.isCollecting && state.scrollAttempts < MAX_SCROLL_ATTEMPTS && state.idleScans < MAX_IDLE_SCANS) {
    scan();
    window.scrollBy({ top: Math.floor(window.innerHeight * 0.85), behavior: "smooth" });
    state = { ...state, scrollAttempts: state.scrollAttempts + 1 };
    await new Promise((resolve) => window.setTimeout(resolve, SCAN_DELAY_MS));
  }

  scan();
  state = { ...state, isCollecting: false };
}

function bookmarksSnapshot(): XBookmark[] {
  return [...state.bookmarks];
}

chrome.runtime.onMessage.addListener((message: PopupToContentMessage, _sender, sendResponse) => {
  if (!isBookmarksPage()) {
    sendResponse({ ok: false, error: "请先打开 X Bookmarks 页面。", state });
    return false;
  }

  if (message.type === "GET_STATUS") {
    scan();
    sendResponse({ ok: true, bookmarks: bookmarksSnapshot(), state });
    return false;
  }

  if (message.type === "START_COLLECTION") {
    if (!state.isCollecting) void collectLoop();
    sendResponse({ ok: true, bookmarks: bookmarksSnapshot(), state: { ...state, isCollecting: true } });
    return false;
  }

  if (message.type === "STOP_COLLECTION") {
    state = { ...state, isCollecting: false };
    sendResponse({ ok: true, bookmarks: bookmarksSnapshot(), state });
    return false;
  }

  if (message.type === "CLEAR_COLLECTION") {
    state = { bookmarks: [], isCollecting: false, lastScanAdded: 0, scrollAttempts: 0, idleScans: 0 };
    sendResponse({ ok: true, bookmarks: bookmarksSnapshot(), state });
    return false;
  }

  sendResponse({ ok: false, error: "未知操作。", state });
  return false;
});
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/shared/messages.ts src/content/main.ts
git commit -m "feat: collect bookmarks from content script"
```

---

### Task 7: Implement Popup UI and Downloads

**Files:**
- Modify: `src/popup/main.ts`
- Modify: `src/popup/styles.css`

- [ ] **Step 1: Implement popup behavior**

Modify `src/popup/main.ts` to:

```ts
import "./styles.css";
import { buildExportZip } from "../shared/exportZip";
import type { PopupToContentMessage } from "../shared/messages";
import type { CollectionState, XBookmark } from "../shared/types";

const root = document.querySelector<HTMLDivElement>("#app");

let bookmarks: XBookmark[] = [];
let state: CollectionState | undefined;

async function sendToActiveTab(message: PopupToContentMessage) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) throw new Error("没有找到当前标签页。");
  return chrome.tabs.sendMessage(tab.id, message);
}

async function fetchImage(url: string): Promise<Blob | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    return response.blob();
  } catch {
    return undefined;
  }
}

async function downloadZip(includeImages: boolean): Promise<void> {
  const blob = await buildExportZip({ bookmarks, includeImages, fetchImage });
  const url = URL.createObjectURL(blob);
  await chrome.downloads.download({
    url,
    filename: `x-bookmarks-export-${new Date().toISOString().slice(0, 10)}.zip`,
    saveAs: true
  });
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function render(error?: string): void {
  if (!root) return;
  const count = bookmarks.length;
  const isCollecting = state?.isCollecting ?? false;

  root.innerHTML = `
    <section class="panel">
      <header>
        <h1>MarkHarbor</h1>
        <p class="muted">在 X Bookmarks 页面采集并导出到 Obsidian。</p>
      </header>
      ${error ? `<p class="error">${error}</p>` : ""}
      <dl class="stats">
        <div><dt>已采集</dt><dd>${count}</dd></div>
        <div><dt>本次新增</dt><dd>${state?.lastScanAdded ?? 0}</dd></div>
        <div><dt>滚动次数</dt><dd>${state?.scrollAttempts ?? 0}</dd></div>
      </dl>
      <label class="check">
        <input id="includeImages" type="checkbox" checked />
        下载图片附件
      </label>
      <div class="actions">
        <button id="start" type="button">${isCollecting ? "采集中..." : "开始采集"}</button>
        <button id="stop" type="button">停止</button>
        <button id="clear" type="button">清空</button>
        <button id="export" type="button" ${count === 0 ? "disabled" : ""}>导出 zip</button>
      </div>
      <p class="hint">视频不会下载，只会保存原帖链接和预览信息。</p>
    </section>
  `;

  document.querySelector("#start")?.addEventListener("click", () => runMessage({ type: "START_COLLECTION" }));
  document.querySelector("#stop")?.addEventListener("click", () => runMessage({ type: "STOP_COLLECTION" }));
  document.querySelector("#clear")?.addEventListener("click", () => runMessage({ type: "CLEAR_COLLECTION" }));
  document.querySelector("#export")?.addEventListener("click", async () => {
    const includeImages = document.querySelector<HTMLInputElement>("#includeImages")?.checked ?? true;
    await downloadZip(includeImages);
  });
}

async function runMessage(message: PopupToContentMessage): Promise<void> {
  try {
    const response = await sendToActiveTab(message);
    if (!response.ok) {
      state = response.state;
      render(response.error);
      return;
    }
    bookmarks = response.bookmarks ?? bookmarks;
    state = response.state;
    render();
  } catch {
    render("请先打开 X Bookmarks 页面，并确认插件已获得当前页面权限。");
  }
}

render();
void runMessage({ type: "GET_STATUS" });
```

- [ ] **Step 2: Implement popup styles**

Modify `src/popup/styles.css` to:

```css
body {
  width: 340px;
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  background: #ffffff;
}

.panel {
  padding: 16px;
}

h1 {
  margin: 0 0 6px;
  font-size: 18px;
}

.muted,
.hint {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}

.error {
  padding: 8px;
  border: 1px solid #fecaca;
  color: #991b1b;
  background: #fef2f2;
  border-radius: 6px;
  font-size: 13px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 14px 0;
}

.stats div {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
}

dt {
  color: #6b7280;
  font-size: 12px;
}

dd {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 700;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

button {
  min-height: 34px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #111827;
  font-size: 13px;
  cursor: pointer;
}

button:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Build**

Run: `npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/popup/main.ts src/popup/styles.css
git commit -m "feat: add popup collection and export controls"
```

---

### Task 8: Add README and Manual Verification Checklist

**Files:**
- Create: `README.md`
- Modify: `tasks/todo.md`

- [ ] **Step 1: Create README**

Create `README.md`:

```md
# MarkHarbor

一个本地优先的 Chrome 插件，用于把已加载的 X Bookmarks 导出为 Obsidian 友好的 Markdown、JSON 和图片附件。

## 隐私说明

- 数据保留在本地。
- 不需要云端账号。
- 不上传书签数据。
- 不读取 X cookie。
- 不调用未公开的 X 内部接口。
- v1 不下载视频文件，只保存原帖链接和可见预览信息。

## 本地开发

```bash
npm install
npm run build
```

然后在 Chrome 打开 `chrome://extensions`，启用开发者模式，选择 `dist/` 作为未打包扩展加载。

## 使用方式

1. 登录 X。
2. 打开 `https://x.com/i/bookmarks`。
3. 点击插件按钮。
4. 点击“开始采集”。
5. 等待插件引导页面滚动并采集已加载书签。
6. 点击“导出 zip”。
7. 将 zip 解压到 Obsidian vault 中。

## 验证清单

- 不在 X Bookmarks 页面时显示提示。
- 在 X Bookmarks 页面能采集可见书签。
- 引导滚动后采集数量增加。
- 停止采集后保留已采集结果。
- 导出的 zip 包包含 `bookmarks.json`。
- 导出的 zip 包包含 `MarkHarbor Export.md`。
- 导出的 zip 包包含 `bookmarks/` 下的单条书签 Markdown 文件。
- 图片下载失败时 Markdown 保留原始图片 URL。
```

- [ ] **Step 2: Update `tasks/todo.md` review section**

Append:

```md

Implementation plan created at `docs/superpowers/plans/2026-05-16-markharbor.md`.
Next step is user approval of execution mode before code implementation.
```

- [ ] **Step 3: Run final checks**

Run: `npm test && npm run typecheck && npm run build`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md tasks/todo.md
git commit -m "docs: add usage and verification checklist"
```

---

## Self-Review

Spec coverage:

- Chrome extension surface: covered by Tasks 1, 6, and 7.
- Guided in-page collection: covered by Tasks 3 and 6.
- Deduplication: covered by Task 2.
- Combined Markdown export: covered by Task 4.
- One note per bookmark export: covered by Task 4.
- JSON export and zip package: covered by Task 5.
- Image attachments with fallback: covered by Tasks 4 and 5.
- Video link-only handling: covered by Tasks 3 and 4.
- Privacy position and README: covered by Task 8.
- Testing strategy: covered by Tasks 2, 3, 4, 5, and 8.

Placeholder scan:

- No unresolved placeholders or unspecified test steps are intentionally left in the plan.

Type consistency:

- Shared type is `XBookmark`.
- Parser function is `parseBookmarksFromDocument`.
- Dedupe function is `mergeBookmarks`.
- Export function is `buildExportZip`.
- Message union is `PopupToContentMessage`.
