# X 书签 Obsidian 导出器

一个本地优先的 Chrome 插件，用于把当前页面已加载的 X Bookmarks 导出为适合 Obsidian 使用的 Markdown 知识库包，同时提供 JSON、CSV、TXT、HTML 和媒体清单。

## 它解决什么问题

X Bookmarks 适合临时收藏，但不适合长期整理、搜索和沉淀。这个插件把你自己登录浏览器里已经加载出来的书签整理成本地文件，让它们可以进入 Obsidian 或其他知识管理工具。

## 功能

- 从 `https://x.com/i/bookmarks` 采集当前页面已加载的书签。
- 通过页面滚动辅助加载更多书签。
- 导出一个 zip 包。
- 生成 `X Bookmarks Index.md` 总索引。
- 每条书签生成一个 Markdown 笔记。
- 支持图片附件下载，并按书签 ID 分目录保存。
- 生成 `media-manifest.json`，说明每个媒体文件来自哪条书签。
- 生成 `export-report.json`，记录导出统计。
- 同时导出 JSON、CSV、TXT、HTML。
- popup 支持中文和英文切换。

## 安装

本项目当前适合本地加载为未打包 Chrome 插件。

```bash
npm install
npm run build
```

然后：

1. 打开 Chrome。
2. 进入 `chrome://extensions`。
3. 开启“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择项目中的 `dist/` 目录。

## 使用方式

1. 登录 X。
2. 打开 `https://x.com/i/bookmarks`。
3. 点击浏览器工具栏里的插件图标。
4. 点击“开始采集”。
5. 等待插件辅助滚动并采集页面中已加载的书签。
6. 需要时点击“停止”。
7. 保持“下载图片附件”开启，或关闭它只保留远程图片链接。
8. 点击“导出 zip”。
9. 将 zip 解压后放入 Obsidian vault。

## 导出包结构

```text
X Bookmarks Index.md
bookmarks/
  2026-05-16-author-title.md
attachments/
  x-bookmarks/
    1234567890/
      image-01-example.jpg
bookmarks.json
bookmarks.csv
links.txt
bookmarks.html
media-manifest.json
export-report.json
```

## Obsidian 使用建议

把解压后的文件夹整体放进 Obsidian vault。优先打开 `X Bookmarks Index.md`，它会列出导出时间、书签总数、媒体下载状态和每条书签的链接。

每条书签 Markdown 包含：

- YAML 属性：来源、原帖链接、作者、handle、发布时间、采集时间、书签 ID。
- `## 原文`：X 页面中可见的正文。
- `## 链接卡片`：如果页面中有文章卡片，会记录标题、描述和链接。
- `## 媒体`：本地图片引用、远程图片兜底链接、视频预览信息。
- `## 来源`：原帖链接。
- `## 我的笔记`：留给你后续补充理解。

## 支持的导出格式

- `Markdown`：Obsidian 主格式，包含索引和单条笔记。
- `JSON`：结构化备份，便于未来重新生成其他格式。
- `CSV`：适合表格查看、筛选、迁移。
- `TXT`：一行一个原帖链接，最低摩擦备份。
- `HTML`：可在浏览器中打开的浏览页。
- `ZIP`：打包容器，不是单独的数据格式。

## 图片和视频说明

图片会在可下载时保存到：

```text
attachments/x-bookmarks/<bookmark-id>/
```

Markdown 会优先引用本地图片。如果图片下载失败，会保留原始远程图片 URL，并在 `media-manifest.json` 中标记为 `failed`。

视频文件不会下载。插件只保存原帖链接和页面中可见的视频预览信息。

## 隐私与权限

本插件的设计边界：

- 数据保留在本地。
- 不需要云端账号。
- 不上传书签数据。
- 不读取 X cookie。
- 不调用未公开的 X 内部接口。
- 不在后台静默抓取。
- 不下载 X 视频文件。

使用的 Chrome 权限：

- `activeTab`：与当前打开的 X Bookmarks 页面通信。
- `downloads`：保存导出的 zip。
- `https://x.com/*`：在 X Bookmarks 页面运行采集脚本。
- `https://pbs.twimg.com/*`：下载 X 图片附件。

## 已知限制

- 导出完整度取决于 X 页面实际加载了多少书签。
- 如果 X 修改页面 DOM，解析器可能需要更新。
- 外部文章全文不会抓取，只保存 X 页面中可见的链接卡片信息。
- X 视频不会下载。
- 图片下载可能因网络、权限或远程限制失败。
- 当前版本不做云同步、AI 总结、自动标签或全文搜索。

## 本地开发

```bash
npm install
npm run build
```

常用命令：

```bash
npm test
npm run typecheck
npm run build
```

## 测试

当前测试覆盖：

- X DOM 解析。
- 书签去重。
- 文件名安全化。
- Markdown 渲染。
- CSV/TXT/HTML/report/manifest 渲染。
- zip 打包结构。
- popup 中英文词典。

运行：

```bash
npm test
npm run typecheck
npm run build
```

## Chrome Web Store 发布说明

更安全的公开表述：

- Export loaded X Bookmarks from your own logged-in browser session.
- Local-first export to Markdown, JSON, CSV, TXT, HTML, and media files.
- No account, no server, no cookie access.

避免表述：

- Download all X bookmarks automatically.
- Bypass X limits.
- Scrape private data.
- Download videos from X.

## FAQ

### 能一键导出全部历史书签吗？

不能承诺。插件只能采集当前 X Bookmarks 页面已经加载出来的内容，并通过滚动辅助加载更多。

### 会不会读取我的 X 密码或 cookie？

不会。插件不读取密码，不读取 cookie，也不调用未公开的 X 内部接口。

### 为什么每条 Markdown 里没有外部文章全文？

当前版本只保存 X 页面可见内容和链接卡片信息。抓取外部全文会引入额外权限、跨站限制、版权和稳定性问题。

### attachments 里的图片怎么知道来自哪里？

V2 按书签 ID 分目录保存图片，并在 `media-manifest.json` 中记录来源书签、原始 URL、本地路径和下载状态。

### 可以不用图片吗？

可以。导出前关闭“下载图片附件”，Markdown 会保留远程图片链接。

## English Quick Start

This is a local-first Chrome extension for exporting loaded X Bookmarks into an Obsidian-friendly zip package.

```bash
npm install
npm run build
```

Load `dist/` from `chrome://extensions` with Developer Mode enabled.

Usage:

1. Open `https://x.com/i/bookmarks`.
2. Click the extension icon.
3. Click `Start collection`.
4. Wait while the page scrolls and loaded bookmarks are collected.
5. Click `Export zip`.
6. Unzip the package into your Obsidian vault.

Privacy:

- No server.
- No account.
- No upload.
- No cookie access.
- No undocumented X API calls.
- No X video downloads.
