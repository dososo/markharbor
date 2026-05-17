# MarkHarbor V2 产品化设计

日期：2026-05-16
状态：待执行

## 背景

当前 MVP 已证明 Chrome 插件路线可行：用户在已登录的 X Bookmarks 页面中，可以采集已加载书签并导出 zip。真实浏览器验收也证明基础链路可运行。

但 MVP 的验收重点偏“文件能生成”，还没有达到“导出结果放进 Obsidian 后真的有用”的标准。用户反馈集中在四点：Markdown 没有形成可读笔记，附件缺少来源上下文，导出格式不够迁移友好，插件界面太像原型。

V2 的目标不是加复杂功能，而是把导出结果做成真正可用的本地知识库包，并把插件体验升级到可公开展示的水平。

## 产品原则

- 导出包必须可理解：用户解压后能立刻知道每个文件是什么。
- 附件必须可追溯：每张图片都能回到对应书签。
- Markdown 必须可用：不是只堆链接，而是有标题、属性、正文、媒体、来源和笔记区。
- 格式必须可迁移：Obsidian 优先，同时保留 CSV、JSON、TXT、HTML 给其他工具使用。
- 插件必须简单：默认一键导出 Obsidian 包，进阶格式可选。
- UI 可以更有表现力，但不能牺牲工具效率。
- 继续保持本地优先：不上传数据，不读 cookie，不调用未公开 X API，不后台偷偷抓取。

## 竞品与行业洞察

### 导出格式

Raindrop 官方导入说明列出的通用迁移格式包括 HTML、CSV、TXT、JSON、ENEX。Raindrop API 的导出格式包括 csv、html、zip。这说明只做 Markdown、JSON、CSV 不够完整，HTML 和 TXT 对迁移、备份、导入其他收藏工具有实际价值。

V2 支持：

- `Markdown`：Obsidian 主格式。
- `JSON`：无损结构化备份。
- `CSV`：表格分析和导入其他收藏工具。
- `TXT`：一行一个链接，最低摩擦迁移。
- `HTML`：可浏览、可分享、可被部分书签工具导入。
- `ZIP`：打包容器，包含 Markdown、附件、清单和报告。

V2 不做：

- `ENEX`：Evernote 生态格式，当前用户目标不是 Evernote，放入后续版本。
- `PDF`：适合阅读快照，不适合知识库再编辑，当前不做。
- 外部文章全文抓取：会引入权限、CORS、反爬和版权风险，当前只保存 X 页面可见内容与链接卡片信息。

### Obsidian 工作流

Obsidian Web Clipper 的核心经验是：模板、变量、属性和保存位置决定剪藏是否有用。V2 不需要复制 Web Clipper，但要借鉴它的结构化思想。

V2 的 Obsidian 包应包含：

```text
X Bookmarks Index.md
bookmarks/
  2026-05-16-author-title.md
attachments/
  x-bookmarks/
    2048046255151206471/
      image-01.jpg
media-manifest.json
export-report.json
bookmarks.json
bookmarks.csv
links.txt
bookmarks.html
```

每条书签笔记应包含：

- YAML 属性：来源、URL、作者、handle、发布时间、采集时间、书签 ID、标签、媒体数量、链接卡片 URL。
- 正文区：X 可见正文。
- 链接卡片区：标题、描述、URL、预览图。
- 媒体区：本地图片引用和视频预览信息。
- 来源区：原帖链接。
- 我的笔记区：留给用户在 Obsidian 中补充理解。

### 附件策略

当前 `attachments` 目录的问题是“图片存在，但不知道是谁的”。V2 改为按书签 ID 分组：

```text
attachments/x-bookmarks/<bookmark-id>/image-01.jpg
```

并生成 `media-manifest.json`：

```json
[
  {
    "bookmarkId": "2048046255151206471",
    "bookmarkUrl": "https://x.com/user/status/2048046255151206471",
    "kind": "image",
    "originalUrl": "https://pbs.twimg.com/media/example.jpg",
    "localPath": "attachments/x-bookmarks/2048046255151206471/image-01.jpg",
    "status": "downloaded"
  }
]
```

如果图片失败：

- Markdown 保留原始 URL。
- `media-manifest.json` 标记 `failed`。
- `export-report.json` 汇总失败数量。

### Chrome 插件体验

竞品和成熟剪藏工具更好的体验通常不是功能更多，而是状态清楚：

- 当前页面是否可采集。
- 已采集多少条。
- 正在做什么。
- 预计导出哪些文件。
- 哪些媒体失败。
- 一键默认导出，同时允许选择格式。

V2 popup 采用三段结构：

1. 状态区：页面状态、采集数量、语言切换。
2. 采集区：开始、停止、清空、进度。
3. 导出区：Obsidian 包默认开启，CSV、JSON、TXT、HTML、图片附件可选。

### 视觉风格

用户提出希望参考 `https://io.google/2026/`。V2 可以借鉴 Google I/O 2026 与 Material 3 Expressive 的方向，但不能复制 Google 品牌。

实际设计原则：

- 使用明亮、干净、有层次的色彩。
- 使用圆角、状态 chip、分段控件、卡片化的导出选项。
- 保持插件 popup 的工具密度，不做落地页式 hero。
- 不使用 Google logo、Google 字样或品牌专属图形。
- 避免单一蓝紫色或过度渐变。

建议视觉关键词：

- expressive but compact
- colorful utility
- local-first privacy
- Obsidian-friendly

### 中英文

V2 支持中文和英文：

- 默认跟随浏览器语言。
- popup 内提供手动切换。
- 语言选择保存在本地。
- manifest 使用 Chrome 官方 i18n 结构。
- README 以中文为主，提供英文 Quick Start。

Chrome 官方 i18n 机制要求 `_locales/<locale>/messages.json`，并在 manifest 中设置 `default_locale`。popup 内的手动切换可以使用应用内字典和本地存储，不必为了语言选择新增远端依赖。

## V2 用户流程

1. 用户打开 X Bookmarks 页面。
2. 打开插件，看到当前页面状态和已采集数量。
3. 点击“开始采集”。
4. 插件滚动并采集已加载书签。
5. 用户看到采集数量、滚动次数、最近新增。
6. 用户保留默认导出设置：Obsidian Markdown 包、JSON、CSV、图片附件。
7. 用户也可以额外开启 TXT 链接列表和 HTML 浏览页。
8. 用户点击导出 zip。
9. zip 解压后可直接复制进 Obsidian vault。
10. 用户打开 `X Bookmarks Index.md`，从索引进入每条书签笔记。

## 数据模型变更

新增链接卡片：

```ts
export interface XBookmarkLinkCard {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}
```

扩展书签：

```ts
export interface XBookmark {
  id?: string;
  url: string;
  authorName?: string;
  authorHandle?: string;
  text: string;
  postedAt?: string;
  collectedAt: string;
  imageUrls: string[];
  linkCard?: XBookmarkLinkCard;
  video?: XBookmarkVideo;
  rawText: string;
}
```

新增媒体清单项：

```ts
export interface ExportedMediaItem {
  bookmarkId?: string;
  bookmarkUrl: string;
  kind: "image" | "card-image" | "video-preview";
  originalUrl: string;
  localPath?: string;
  status: "downloaded" | "failed" | "remote-only";
}
```

## 导出文件说明

### `X Bookmarks Index.md`

索引文件，包含导出时间、书签总数、媒体成功/失败统计、按时间排序的书签列表、到每条书签 Markdown 的链接。

### `bookmarks/*.md`

每条书签一个 Obsidian 笔记。示例：

```markdown
---
title: "Alice - Useful thread"
source: "x-bookmarks"
x_url: "https://x.com/alice/status/123"
author: "Alice"
handle: "@alice"
posted_at: "2026-05-15T12:30:00.000Z"
collected_at: "2026-05-16T00:00:00.000Z"
bookmark_id: "123"
tags:
  - x-bookmarks
---

# Alice - Useful thread

## 原文

Useful thread

## 链接卡片

- 标题：Example article
- 链接：<https://example.com/article>

## 媒体

![](../attachments/x-bookmarks/123/image-01.jpg)

## 来源

- 原帖：<https://x.com/alice/status/123>

## 我的笔记
```

### `bookmarks.csv`

字段：`id`、`url`、`author_name`、`author_handle`、`text`、`posted_at`、`collected_at`、`image_urls`、`link_card_url`、`link_card_title`。

### `links.txt`

一行一个原帖链接。

### `bookmarks.html`

一个可浏览 HTML 文件，包含每条书签标题、作者、正文摘要和原帖链接。

### `media-manifest.json`

记录每个媒体文件的来源、类型、本地路径和下载状态。

### `export-report.json`

记录导出时间、书签数量、生成文件数量、媒体下载成功数量、媒体下载失败数量、未下载视频数量。

## README 范围

V2 README 必须补齐：

- 项目定位。
- 功能清单。
- 安装方式。
- 使用步骤。
- 导出格式说明。
- Obsidian 导入方式。
- 附件目录解释。
- 隐私与权限说明。
- 已知限制。
- 开发命令。
- 测试命令。
- Chrome Web Store 发布边界。
- FAQ。
- English Quick Start。

## 公开发布边界

Chrome Web Store 更安全的表述是：

- “Export loaded X Bookmarks from your own logged-in browser session.”
- “Local-first export to Markdown/JSON/CSV.”
- “No account, no server, no cookie access.”

避免表述：

- “Download all X bookmarks automatically.”
- “Bypass X limits.”
- “Scrape private data.”
- “Download videos from X.”

## 成功标准

V2 达成标准：

- zip 解压后，用户可以从 `X Bookmarks Index.md` 理解整个导出包。
- 每条 Markdown 笔记即使没有外部文章全文，也有清楚的原文、链接卡片、媒体、来源和笔记区。
- `attachments` 中每张图片都能通过 Markdown 引用和 `media-manifest.json` 追溯来源。
- 支持 JSON、CSV、Markdown、TXT、HTML。
- popup 支持中文/英文切换。
- popup 视觉明显优于 MVP，但仍是高效工具界面。
- README 足以让新用户安装、使用、理解限制并自行验收。

## 参考资料

- Raindrop Import: https://help.raindrop.io/import
- Raindrop Export API: https://developer.raindrop.io/v1/export
- Obsidian Web Clipper Templates: https://obsidian.md/help/web-clipper/templates
- Chrome i18n API: https://developer.chrome.com/docs/extensions/reference/api/i18n
- Google I/O 2026: https://io.google/2026/
