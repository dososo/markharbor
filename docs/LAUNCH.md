# Launch Copy

## Repository One-Liner

MarkHarbor is a local-first Chrome extension that turns loaded X Bookmarks into an Obsidian-ready archive.

## 中文一句话

MarkHarbor 是一个本地优先的 Chrome 扩展，可以把 X Bookmarks 批量导出成 Obsidian 知识库包。

## X Long Post Draft

我做了一个开源 Chrome 扩展：MarkHarbor。

它解决一个很具体的问题：X Bookmarks 很适合随手收藏，但不适合长期知识管理。收藏越多越难找，内容可能被删除或修改，列表页正文经常被截断，图片、X Article、链接卡片也很难和自己的笔记系统放在一起。

MarkHarbor 的目标是把这些收藏尽量完整地搬到本地，整理成 Obsidian 友好的知识库包。

它现在可以：

- 从 `https://x.com/i/bookmarks` 采集已加载书签
- 自动滚动加载更多内容
- 为每条书签生成独立 Markdown
- 生成可点击的 `X Bookmarks Index.md`
- 导出 JSON、CSV、TXT、HTML
- 下载可访问的 X 图片附件
- 尝试增强 X 原帖正文
- 尝试采集 X Article 正文、图片和基础排版
- 生成 `media-manifest.json` 和 `export-report.json`

它不做这些事：

- 不上传书签
- 不需要云账号
- 不读取 X 密码或 cookie
- 不调用未公开的 X 内部接口
- 不下载视频
- 不抓外部文章全文

当前还没有上架 Chrome Web Store，所以安装方式是从 GitHub Releases 下载 zip，解压后在 Chrome 开发者模式里加载 unpacked extension。

GitHub:
https://github.com/dososo/markharbor

Release:
https://github.com/dososo/markharbor/releases/latest

操作演示视频:
https://github.com/dososo/markharbor/releases/download/v0.1.11/markharbor-demo-2026-05-17.mp4

如果你也把 X Bookmarks 当成写作素材库、研究 inbox 或灵感收集箱，欢迎试用、提 issue 或直接贡献。

## English Launch Post

I built MarkHarbor, an open source Chrome extension for turning loaded X Bookmarks into an Obsidian-ready local archive.

X Bookmarks are useful for saving things quickly, but they are not a long-term knowledge base. Search is limited, context can disappear, bookmark cards often show truncated text, and X Article content or images are hard to keep with your notes.

MarkHarbor exports your loaded bookmarks into:

- One Markdown note per bookmark
- A clickable Obsidian index
- JSON, CSV, TXT, and HTML
- Local image attachments when accessible
- A media manifest and export report
- Best-effort X post and X Article detail enhancement

It is local-first:

- No cloud account
- No data upload
- No X password or cookie access
- No undocumented X internal API calls
- No video downloading

It is not on the Chrome Web Store yet. Install it from GitHub Releases by downloading the zip, unzipping it, and loading the extracted folder as an unpacked Chrome extension.

GitHub:
https://github.com/dososo/markharbor

Latest release:
https://github.com/dososo/markharbor/releases/latest

Demo video:
https://github.com/dososo/markharbor/releases/download/v0.1.11/markharbor-demo-2026-05-17.mp4

## Hacker News / Reddit Short Post

MarkHarbor is an open source, local-first Chrome extension that exports loaded X Bookmarks into an Obsidian-ready archive: Markdown notes, a clickable index, JSON, CSV, HTML, image attachments, media manifest, and export report.

It does not upload data, read cookies, call undocumented X APIs, or download videos. It is focused on a narrow workflow: getting saved X content out of the platform and into local files you control.

GitHub: https://github.com/dososo/markharbor
