# MarkHarbor

[![CI](https://github.com/dososo/markharbor/actions/workflows/ci.yml/badge.svg)](https://github.com/dososo/markharbor/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/dososo/markharbor)](https://github.com/dososo/markharbor/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-extension-4285F4)](docs/INSTALL.md)

**X Bookmarks to Obsidian，本地优先的书签归档港。**

MarkHarbor 把 X Bookmarks 变成一个可离线保存、可检索、可二次写作的 Obsidian 知识库包。

> 本项目是一个本地优先的 Chrome 扩展：在你自己的浏览器里读取已加载的 X Bookmarks，导出 Markdown、JSON、CSV、TXT、HTML 和媒体清单。当前版本面向本地加载和开源协作，尚未上架 Chrome Web Store。

![MarkHarbor social preview](docs/assets/markharbor-social-preview.svg)

[English](#english)

## 当前状态

- 当前版本：`0.1.11`
- 发布方式：GitHub Releases 下载 zip，手动加载为 Chrome unpacked extension
- 许可证：MIT
- 商店状态：尚未上架 Chrome Web Store
- 最新版本：[GitHub Releases](https://github.com/dososo/markharbor/releases/latest)

## 截图

| 插件采集中 | 导出包结构 |
| --- | --- |
| ![MarkHarbor 插件采集中](docs/assets/screenshots/popup-collecting.png) | ![MarkHarbor 导出包结构](docs/assets/screenshots/export-zip-structure.png) |

| Obsidian 单条笔记 | HTML 离线预览 |
| --- | --- |
| ![MarkHarbor Obsidian 单条笔记](docs/assets/screenshots/obsidian-note.png) | ![MarkHarbor HTML 离线预览](docs/assets/screenshots/html-preview.png) |

## 为什么做它？

X Bookmarks 很适合“先收藏，之后再看”，但它不适合长期知识管理：

- 收藏越多越难找，列表只能反复滚动。
- 很多高价值内容会被平台、作者删除或改动。
- 列表页经常只显示截断正文，真正想沉淀时上下文不够。
- 图片、链接卡片、X Article 长文内容很难和笔记系统保持在一起。
- Obsidian 用户最终需要的是本地 Markdown，而不是困在平台里的收藏夹。

MarkHarbor 的目标很简单：把你已经收藏的 X 内容尽量完整地搬到本地，整理成 Obsidian 友好的文件结构，让它变成你自己的资料库。

## 它是什么？

MarkHarbor 是一个 Chrome Manifest V3 扩展。它在 `https://x.com/i/bookmarks` 页面工作，辅助滚动并采集当前已加载的书签，随后导出一个 zip 包。

核心功能：

- 采集 X Bookmarks 列表中已加载的书签。
- 自动滚动加载更多书签，支持手动停止。
- 区分“已发现”和“详情完成”，避免把列表发现误解为全文采集完成。
- 为每条书签生成单独 Markdown 笔记。
- 生成 `X Bookmarks Index.md`，可点击跳转到对应笔记。
- 导出 JSON、CSV、TXT、HTML，便于备份、表格分析和迁移。
- 下载可访问的 X 图片附件，并按书签 ID 分目录保存。
- 尝试增强 X 原帖正文，补齐列表页截断内容。
- 对 X Article 尝试读取详情页正文、正文图片和基础排版结构。
- 保留链接卡片标题、描述、URL。
- 不下载视频，只保存原帖链接和可见预览信息。
- popup 支持中文和英文切换。

## 能解决什么问题？

适合这些场景：

- 把 X Bookmarks 备份到本地，避免收藏内容只存在平台里。
- 将高价值推文、X Article、链接卡片整理到 Obsidian。
- 为写作、研究、选题、竞品分析、灵感库建立可检索素材库。
- 用 CSV/JSON 对收藏做二次处理。
- 用 HTML 快速浏览导出结果。
- 用 `media-manifest.json` 追踪每张图片来自哪条书签。

## 和同类工具有什么不同？

社区里已经有不少 X/Twitter bookmark manager 或 exporter。它们通常偏向：

- 搜索和管理收藏库。
- 云端同步、标签、文件夹、团队分享。
- 导出 CSV、JSON、Markdown、PDF 等通用格式。
- 更强的批量管理或商业化功能。

本项目的定位更窄，也更明确：

- **Obsidian-first**：不是只导出一个 Markdown 文件，而是生成索引、单条笔记、YAML 属性、附件目录和媒体清单。
- **Local-first**：不需要云账号，不上传数据，不接管你的资料库。
- **X Bookmarks 专用**：围绕 X Bookmarks 的无限滚动、截断正文、X Article、图片附件和链接卡片做定制。
- **结构化导出**：Markdown 给 Obsidian，JSON 给程序，CSV 给表格，HTML 给浏览，TXT 给最小备份。
- **失败安全回退**：详情页增强失败时保留列表页可见内容，而不是中断整次导出。
- **开源可审计**：权限、导出结构和解析逻辑都可以在代码里检查。

## 和 Obsidian Web Clipper 有什么区别？

[Obsidian Web Clipper](https://obsidian.md/clipper) 是官方、通用、功能强大的网页剪藏工具。它适合保存当前网页、选中文本、高亮、模板、变量、站点规则等工作流。

这个项目不是替代 Obsidian Web Clipper，而是补齐另一个场景：

| 对比项 | Obsidian Web Clipper | MarkHarbor |
| --- | --- | --- |
| 核心对象 | 当前网页 | X Bookmarks 列表 |
| 工作方式 | 手动剪藏当前页面或选区 | 批量采集已加载书签 |
| 模板能力 | 强，支持模板、变量、规则 | 固定为 Obsidian 知识库包结构 |
| X Bookmarks 批量导出 | 不是主要目标 | 核心目标 |
| X Article 增强 | 依赖当前页面剪藏结果 | 针对 X Article 做详情页增强 |
| 附件结构 | 由剪藏配置和 Obsidian 工作流决定 | 按书签 ID 保存到 `attachments/x-bookmarks/` |
| 输出结果 | 直接进入 Obsidian 工作流 | zip 包，可审计、可备份、可迁移 |

一句话：Web Clipper 是通用网页剪藏刀；MarkHarbor 是专门把 X Bookmarks 批量整理成 Obsidian 资料库的导出器。

## 安装

MarkHarbor 尚未上架 Chrome Web Store。公开发布阶段推荐从 GitHub Releases 下载扩展 zip，解压后作为“已解压的扩展程序”加载。

### 方式 A：从 GitHub Releases 安装

适合普通用户。

1. 打开本仓库的 `Releases` 页面。
2. 下载最新版本的 `markharbor-vX.Y.Z.zip`。
3. 解压 zip。
4. 打开 Chrome 的 `chrome://extensions`。
5. 开启右上角“开发者模式”。
6. 点击“加载已解压的扩展程序”。
7. 选择解压后的 `markharbor/` 文件夹。这个文件夹里应当包含 `manifest.json`。
8. 打开 `https://x.com/i/bookmarks`。
9. 点击浏览器工具栏中的 MarkHarbor 图标。

请保留解压后的 `markharbor/` 文件夹。Chrome 会从这个本地目录读取插件文件，移动或删除目录可能导致插件失效。

更新版本时，下载新的 release zip，解压后替换旧文件夹，然后在 `chrome://extensions` 中点击 MarkHarbor 的“重新加载”。

### 方式 B：从源码构建

适合开发者或想先审计源码的用户。

```bash
npm ci
npm run build
```

然后在 `chrome://extensions` 中加载生成的 `dist/` 目录。

### 方式 C：本地生成 release zip

```bash
npm run package
```

生成文件：

```text
release/markharbor-vX.Y.Z.zip
```

更详细的安装说明见 [docs/INSTALL.md](docs/INSTALL.md)。

## 使用方法

1. 登录 X。
2. 打开 [X Bookmarks](https://x.com/i/bookmarks)。
3. 点击扩展图标。
4. 默认保持“下载图片附件”和“完整正文配图高级模式”开启。
5. 点击“开始采集”。
6. 等待页面滚动和详情增强完成。
7. 如需提前结束，点击“停止”。
8. 点击“导出 zip”。
9. 解压 zip，把整个文件夹放入 Obsidian vault。
10. 从 `X Bookmarks Index.md` 开始浏览。

### 计数说明

popup 中的统计含义：

- `已发现`：当前已从 X Bookmarks 列表 DOM 识别到的书签数。
- `本轮发现`：本次点击“开始采集”后新发现的书签数。
- `详情完成`：正文与配图增强完成数 / 已入队增强总数。

所以开始后立刻出现 `已发现 4` 是正常的，它表示当前页面已经可见并识别到 4 条书签，不代表 4 条详情增强都已完成。

## 导出结构

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

## 文件格式

### `X Bookmarks Index.md`

总索引文件，包含：

- 导出时间。
- 书签数量。
- 媒体下载成功/失败数量。
- 每条书签对应的 Markdown 链接。

### `bookmarks/*.md`

每条书签一份 Obsidian 笔记，包含：

- YAML 属性：来源、原帖链接、作者、handle、发布时间、采集时间、书签 ID、正文来源、增强状态。
- `## 原文`：优先使用详情页增强后的正文和图片；失败时回退到列表页可见内容。
- `## X 文章`：X Article 标题和摘要。
- `## 链接卡片`：外部链接卡片标题、描述和 URL。
- `## 媒体`：封面图、卡片图、其它媒体图和视频预览链接。
- `## 来源`：原帖链接、正文来源、增强结果。
- `## 我的笔记`：留给你写二次理解。

### `bookmarks.json`

完整结构化数据，适合二次开发或重新生成其它格式。

### `bookmarks.csv`

表格格式，包含：

- `id`
- `url`
- `author_name`
- `author_handle`
- `text`
- `text_source`
- `text_enhancement_status`
- `posted_at`
- `collected_at`
- `image_urls`
- `article_title`
- `article_preview`
- `link_card_url`
- `link_card_title`
- `link_card_description`

### `links.txt`

一行一个原帖链接，适合最小备份或导入其它工具。

### `bookmarks.html`

可直接用浏览器打开的浏览版导出，正文会尽量保留标题、段落、列表和图片结构。

### `media-manifest.json`

媒体清单，记录每个媒体文件：

- 来源书签 ID。
- 来源书签 URL。
- 媒体类型。
- 原始 URL。
- 本地路径。
- 下载状态。

### `export-report.json`

导出报告，记录导出时间、书签数量、文件数量、媒体下载统计和视频跳过数量。

## 隐私与权限

设计原则：

- 本地优先。
- 不需要云账号。
- 不上传书签数据。
- 不读取 X 密码。
- 不读取 X cookie。
- 不调用未公开的 X 内部接口。
- 不在用户未触发采集时后台静默抓取。
- 不下载 X 视频。

Chrome 权限说明：

| 权限 | 用途 |
| --- | --- |
| `activeTab` | 与当前打开的 X Bookmarks 页面通信 |
| `downloads` | 保存导出的 zip |
| `scripting` | 注入采集脚本，并在详情页读取渲染正文 |
| `https://x.com/*` | 在 X Bookmarks 和同源详情页工作 |
| `https://pbs.twimg.com/*` | 下载 X 图片附件 |

## 已知限制

- 不能保证一键导出全部历史书签；完整度取决于 X 页面实际加载和滚动结果。
- X 页面 DOM 经常变化，解析器可能需要更新。
- X Article 完整正文和图片依赖详情页渲染，失败时会回退到列表页标题/摘要或可见正文。
- X Article 的排版是基于 DOM、字体大小、粗细、列表符号和图片节点推断，不保证 100% 复刻原站视觉。
- 外部文章全文不会抓取，只保存 X 页面中可见的链接卡片信息。
- 图片下载可能因网络、权限或远程限制失败。
- 视频不会下载，只保存原帖链接和可见预览。
- 当前版本不做云同步、全文搜索、AI 总结、自动标签或团队协作。

## FAQ

### 可以导出全部 X Bookmarks 吗？

不能承诺。插件只能读取当前 X Bookmarks 页面已经加载出来的内容，并通过滚动辅助加载更多。X 页面本身的加载限制会影响结果。

### 为什么刚开始就显示已发现 4？

这表示当前页面 DOM 里已经能识别到 4 条书签。它不是“4 条全文和图片都已经增强完成”。详情增强进度看 `详情完成`。

### 会读取我的 X 密码或 cookie 吗？

不会。插件运行在你已登录的浏览器页面里，不读取密码，不读取 cookie。

### 会上传我的书签吗？

不会。导出在本地完成，结果保存为 zip。

### 为什么有些 X Article 还是不完整？

X Article 的完整正文和正文图片依赖 X 详情页渲染。如果 X 没有把某段内容挂载到 DOM、网络加载失败或页面结构变化，插件会安全回退，不会伪造内容。

### 为什么不抓外部文章全文？

抓外部文章全文需要更宽的 host permissions，并会遇到 CORS、反爬、付费墙、版权和 Chrome Web Store 审核风险。当前版本只增强 X 原帖和 X Article。

### 图片会保存在哪里？

默认保存到：

```text
attachments/x-bookmarks/<bookmark-id>/
```

Markdown 和 HTML 会优先引用本地图片；下载失败时保留远程 URL，并在 `media-manifest.json` 中标记。

### 可以关闭图片下载吗？

可以。导出前取消“下载图片附件”，Markdown/HTML 会保留远程图片链接。

### 能导出 likes、profile、列表或搜索结果吗？

当前不支持。这个项目只聚焦 X Bookmarks。

## 本地开发

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run package
```

当前测试覆盖：

- X Bookmarks DOM 解析。
- 原帖详情页正文增强和失败回退。
- X Article 正文、图片和快照累积。
- 采集状态和停止逻辑。
- popup 中英文 UI。
- Markdown、CSV、TXT、HTML、manifest、report 渲染。
- zip 打包结构。
- 文件名安全化和去重。

## 开源仓库材料

本仓库已包含面向 GitHub 开源发布的基础材料：

- [LICENSE](LICENSE)：MIT License。
- [CONTRIBUTING.md](CONTRIBUTING.md)：贡献指南。
- [SECURITY.md](SECURITY.md)：安全和隐私问题反馈方式。
- [SUPPORT.md](SUPPORT.md)：支持和提问说明。
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)：社区行为准则。
- [CHANGELOG.md](CHANGELOG.md)：版本变更记录。
- [docs/INSTALL.md](docs/INSTALL.md)：安装说明。
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)：故障排查。
- [docs/RELEASE.md](docs/RELEASE.md)：发布流程。
- [docs/PRIVACY.md](docs/PRIVACY.md)：隐私说明。
- [docs/ROADMAP.md](docs/ROADMAP.md)：路线图。
- [docs/STORE_LISTING.md](docs/STORE_LISTING.md)：Chrome Web Store 上架文案草稿。
- [docs/LAUNCH.md](docs/LAUNCH.md)：X / GitHub / 社区发布文案。
- [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md)：截图清单。
- `.github/ISSUE_TEMPLATE/`：bug report 和 feature request 模板。
- `.github/workflows/ci.yml`：PR 和 push 的测试、类型检查、构建、审计和打包。
- `.github/workflows/release.yml`：推送 `vX.Y.Z` tag 后自动生成 GitHub Release zip。
- `.github/dependabot.yml`：依赖和 GitHub Actions 更新提醒。

## 适合用于 X 长文的一句话

我做了一个开源 Chrome 扩展 MarkHarbor，可以把 X Bookmarks 批量导出成 Obsidian 知识库包：每条收藏生成独立 Markdown，带索引、YAML、图片附件、JSON、CSV、HTML 和媒体清单；本地运行，不需要账号，不上传数据。

## License

MIT License. See [LICENSE](LICENSE).

---

## English

# MarkHarbor

**X Bookmarks to Obsidian, a local-first archive harbor for your saved posts.**

A local-first Chrome extension that turns loaded X Bookmarks into an Obsidian-ready knowledge package.

It exports your loaded X Bookmarks into Markdown notes, an index file, JSON, CSV, TXT, HTML, image attachments, a media manifest, and an export report.

## Why?

X Bookmarks are useful for saving things quickly, but they are not a long-term knowledge base:

- Bookmarks become hard to search and revisit.
- Valuable posts may disappear or change.
- The bookmarks list often shows truncated text.
- X Article content, images, and link cards are hard to preserve in context.
- Obsidian users need local Markdown files, not a locked platform list.

This extension helps you move your saved X content into files you control.

## Features

- Collect loaded bookmarks from `https://x.com/i/bookmarks`.
- Auto-scroll to load more bookmarks.
- Export one Markdown note per bookmark.
- Generate a clickable `X Bookmarks Index.md`.
- Export JSON, CSV, TXT, HTML, media manifest, and export report.
- Download accessible X images into local attachment folders.
- Attempt to enrich truncated post text from the X detail page.
- Attempt to capture X Article body text, inline images, and readable structure.
- Preserve link card title, description, and URL.
- Local-first: no cloud account, no upload, no cookie access.
- Chinese and English popup UI.

## How it differs from Obsidian Web Clipper

[Obsidian Web Clipper](https://obsidian.md/clipper) is the official general-purpose web clipping tool for Obsidian. It is great for clipping the current page, highlights, templates, variables, and site rules.

MarkHarbor focuses on a narrower workflow: batch-exporting X Bookmarks into an Obsidian-ready archive.

| Area | Obsidian Web Clipper | MarkHarbor |
| --- | --- | --- |
| Main target | Current web page | X Bookmarks list |
| Workflow | Clip one page or selection | Batch collect loaded bookmarks |
| Templates | Powerful and customizable | Fixed Obsidian archive structure |
| X Bookmarks batch export | Not its main purpose | Core purpose |
| Output | Obsidian clipping workflow | Auditable zip package |
| Attachments | Depends on clipper workflow | Per-bookmark attachment folders |

## Install

MarkHarbor is not on the Chrome Web Store yet. The recommended public installation path is a GitHub Release zip loaded as an unpacked extension.

### Option A: Install from GitHub Releases

1. Open this repository's `Releases` page.
2. Download the latest `markharbor-vX.Y.Z.zip`.
3. Unzip it.
4. Open `chrome://extensions`.
5. Enable `Developer mode`.
6. Click `Load unpacked`.
7. Select the extracted `markharbor/` folder that contains `manifest.json`.
8. Open `https://x.com/i/bookmarks`.
9. Click the MarkHarbor extension icon.

Keep the extracted `markharbor/` folder on disk. Chrome loads unpacked extensions from that local folder.

### Option B: Build from source

```bash
npm ci
npm run build
```

Then load the generated `dist/` folder from `chrome://extensions`.

### Option C: Package locally

```bash
npm run package
```

This creates `release/markharbor-vX.Y.Z.zip`.

## Usage

1. Log in to X.
2. Open `https://x.com/i/bookmarks`.
3. Click the extension icon.
4. Keep image download and advanced full article mode enabled if needed.
5. Click `Start collection`.
6. Wait for scrolling and detail enhancement.
7. Click `Stop` if you want to end early.
8. Click `Export zip`.
9. Unzip the package into your Obsidian vault.
10. Start from `X Bookmarks Index.md`.

## Export structure

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

## Privacy and permissions

The extension:

- Does not require a cloud account.
- Does not upload bookmark data.
- Does not read your X password.
- Does not read X cookies.
- Does not call undocumented X internal APIs.
- Does not silently collect data before you start.
- Does not download X videos.

Permissions:

- `activeTab`: communicate with the active X Bookmarks page.
- `downloads`: save the exported zip.
- `scripting`: inject the collector and read rendered detail pages.
- `https://x.com/*`: run on X Bookmarks and same-origin detail pages.
- `https://pbs.twimg.com/*`: download X image attachments.

## Known limitations

- It cannot guarantee exporting your entire historical bookmark archive.
- Completeness depends on what X actually loads in the page.
- X DOM changes may break parsing.
- X Article capture is best-effort and safely falls back when detail rendering fails.
- External article full text is not fetched.
- X videos are not downloaded.
- No cloud sync, AI summary, auto-tagging, or full-text search yet.

## FAQ

### Does it export all X Bookmarks?

Not guaranteed. It collects what the X Bookmarks page can load during scrolling.

### Why does the count jump immediately after starting?

`Discovered` means bookmarks found in the current page DOM. It does not mean all detail text and images are finished. Check `Details done` for enrichment progress.

### Does it upload my data?

No. Export runs locally and saves a zip file.

### Does it fetch external article full text?

No. It only preserves link card metadata visible on X. Fetching arbitrary external pages would require broader permissions and create stability, copyright, and review risks.

### Does it download videos?

No. It only saves source links and visible preview information.

## License

MIT License. See [LICENSE](LICENSE).
