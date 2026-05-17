# Codex Handoff

## 任务目标

构建并产品化一个本地优先的 Chrome 插件，用于从用户已登录的 X Bookmarks 页面采集已加载书签，并导出为适合 Obsidian 使用的本地知识库包。

当前分支：`codex/v2-productization`

## 已完成内容

- 完成 Chrome MV3 插件 MVP：popup、content script、X Bookmarks DOM 解析、引导滚动采集、zip 导出。
- 支持导出 `bookmarks.json`、Obsidian Markdown、图片附件。
- 完成 V2 产品化规划文档和 implementation plan。
- 新增可见链接卡片解析。
- 新增 CSV、TXT、HTML、`media-manifest.json`、`export-report.json` 渲染。
- 升级 Obsidian Markdown：
  - `X Bookmarks Index.md`
  - 每条书签一个 Markdown 文件
  - YAML 属性
  - 原文、链接卡片、媒体、来源、我的笔记区
- 图片附件改为按书签 ID 分目录保存。
- 媒体清单记录图片来源、原始 URL、本地路径和下载状态。
- popup 支持中文/英文切换。
- popup 完成一轮更明亮、紧凑的产品化样式。
- Chrome manifest 增加 `_locales` 中英文文案。
- README 已补全中文说明和 English Quick Start。
- 修复安全审计问题：
  - `vite` 升级到 `^8.0.13`
  - `vitest` 升级到 `^4.1.6`
  - `npm audit --audit-level=moderate` 当前为 0 vulnerabilities
- 修复 X 图片附件无后缀问题：
  - 支持从 `?format=jpg/png/webp/gif` 推断文件后缀
  - zip 中图片写入普通文件权限
- 修复 V2 Task 7 P0 验收反馈：
  - popup 错误状态改为本地化 key，切换语言后错误提示会重新翻译
  - 错误区加入 `https://x.com/i/bookmarks` 入口
  - `GET_STATUS` 不再触发扫描，未点击“开始采集”前不预先计数
  - “本次新增”改为“本轮新增”
  - 采集停止逻辑改为手动停止优先，自动停止只在到底且页面高度多轮稳定后发生
  - `X Bookmarks Index.md` 改为稳定 Markdown 链接
  - 标题优先使用链接卡片标题，其次推文第一行，并去换行、限长
  - CSV/HTML 补充链接卡片描述字段
- 修复已打开 X Bookmarks 页面无法被 popup 识别的问题：
  - manifest 增加 `scripting` 权限
  - popup 发消息失败时，会在当前 `https://x.com/i/bookmarks` 标签页注入 `assets/content.js` 并重试
  - 避免用户必须手动刷新页面
- 实现 X 原帖详情页正文增强采集：
  - 对本轮新增书签请求同源 X 原帖详情页
  - 优先解析 `window.__INITIAL_STATE__` 中的 `tweets.entities[ID].full_text`
  - 找不到初始状态正文时，再兜底解析详情页 DOM
  - 详情页正文更完整时补齐单条书签正文
  - 请求失败、非 HTML、解析不到正文或详情页正文不更完整时安全回退
  - 记录正文来源和增强状态
  - Markdown、CSV、HTML、JSON 导出均体现增强后的正文和状态
  - 点击“开始采集”会清空 content script 残留状态，避免旧空正文书签跳过增强
- 增强 X Article 正文采集：
  - 列表页 `tweetText` 为空但存在 X Article 卡片时，解析文章标题和摘要作为可见正文
  - 新增 background service worker，在用户触发采集后打开非激活 X 详情页，读取渲染后的 Article 完整正文，完成后关闭详情页
  - 完整正文读取失败时，保留列表页标题和摘要，并记录增强失败或无需增强
  - Markdown front matter、单条 Markdown、CSV、HTML、JSON 均保留 X Article 标题和摘要
- 增强正文排版：
  - 新增 `contentBlocks`，用同一套结构化正文块支撑 Markdown 和 HTML 渲染
  - X Article 详情页会尽量提取标题、段落、小标题、列表项和加粗片段
  - 单条 Markdown 的 `## 原文` 现在会输出 Obsidian 友好的 Markdown，而不是只塞一整段纯文本
  - HTML 导出会输出 `<h2>`、`<h3>`、`<p>`、`<ul><li>` 等语义结构
  - 无法识别结构时仍回退到原有纯文本正文
- 增强正文图片：
  - `contentBlocks` 新增 image block，X Article 正文图片会按原文顺序插入 Markdown/HTML 正文
  - zip 打包会扫描正文块图片，只出现在正文里的图片也会下载并写入 `media-manifest.json`
  - Markdown 正文图片下载成功时使用本地附件路径，失败或禁用图片下载时保留远程 URL
  - HTML 导出会显示正文图片、封面图、链接卡片图和其它媒体图
- 新增项目级 `AGENTS.md`，明确所有文档生成、回复和过程说明都只使用中文。

## 修改过的文件

- `package.json`
- `package-lock.json`
- `README.md`
- `docs/superpowers/specs/2026-05-16-x-bookmarks-obsidian-exporter-design.md`
- `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md`
- `docs/superpowers/plans/2026-05-16-x-bookmarks-obsidian-exporter.md`
- `docs/superpowers/plans/2026-05-16-x-bookmarks-v2-productization.md`
- `public/_locales/en/messages.json`
- `public/_locales/zh_CN/messages.json`
- `src/content/main.ts`
- `src/content/collection.ts`
- `src/content/collection.test.ts`
- `src/content/enrichText.ts`
- `src/content/enrichText.test.ts`
- `src/content/parseBookmarks.ts`
- `src/content/parseBookmarks.test.ts`
- `src/background/main.ts`
- `src/background/renderedText.ts`
- `src/background/renderedText.test.ts`
- `src/manifest.ts`
- `src/manifest.test.ts`
- `src/popup/i18n.ts`
- `src/popup/i18n.test.ts`
- `src/popup/main.ts`
- `src/popup/main.test.ts`
- `src/popup/styles.css`
- `src/shared/types.ts`
- `src/shared/messages.ts`
- `src/shared/contentBlocks.ts`
- `src/shared/exportFormats.ts`
- `src/shared/exportFormats.test.ts`
- `src/shared/exportZip.ts`
- `src/shared/exportZip.test.ts`
- `src/shared/filenames.ts`
- `src/shared/filenames.test.ts`
- `src/shared/markdown.ts`
- `src/shared/markdown.test.ts`
- `src/test/fixtures/xBookmarkCard.ts`
- `AGENTS.md`
- `tasks/todo.md`
- `tasks/lessons.md`
- `docs/codex-handoff.md`

## 当前未完成事项

- 真实 Chrome 插件手动验收仍未完全通过，`V2 Task 7` 保持打开状态，需用户在本机完成 checklist。
- 外部文章全文抓取未实现：
  - 需要更宽 host permissions、跨站请求处理和 Chrome Web Store 审核风险评估。

## 已跑过的命令和测试结果

- `npm install -D vite@^8.0.13 vitest@^4.1.6`
  - 结果：安装完成，`found 0 vulnerabilities`
- `npm audit --audit-level=moderate`
  - 结果：通过，`found 0 vulnerabilities`
- `npm test`
  - 结果：通过，12 个测试文件，74 个测试通过
- `npm run typecheck`
  - 结果：通过
- `npm run build`
  - 结果：通过，生成 `dist/`，包含 `dist/assets/background.js`
- `npm ls vite vitest esbuild`
  - 结果：`vite@8.0.13`，`vitest@4.1.6`
- 本地 zip 结构验证
  - 结果：通过，样例 zip 包含 `X Bookmarks Index.md`、`bookmarks.json`、`bookmarks.csv`、`links.txt`、`bookmarks.html`、`media-manifest.json`、`export-report.json`、`bookmarks/`、`attachments/x-bookmarks/`
- Chrome 自动化验收
  - 结果：未完全通过。自动化确认真实 Chrome 中存在 `https://x.com/i/bookmarks` 标签页，但读取页面内容连续超时，未能完成 popup/end-to-end 自动验收。
- V2 Task 7 P0 修复验证
  - 结果：`npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate` 均通过，audit 为 0 vulnerabilities。
- V2 Task 7 P2 原帖正文增强验证
  - 结果：`npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate` 均通过，audit 为 0 vulnerabilities。
- 已打开页面自动注入验证
  - 结果：popup 单测覆盖消息接收端缺失时自动注入 `assets/content.js` 并重试；manifest 单测覆盖 `scripting` 权限。
- X Article 正文增强验证
  - 结果：列表页 Article 卡片解析、后台非激活详情页读取、正文增强回填、Markdown/CSV/HTML 导出和 manifest 背景脚本测试均通过。
  - 结果：`git diff --check` 通过。
- 正文排版格式化验证
  - 结果：单条 Markdown 结构化正文、HTML 语义正文、渲染详情页正文块提取、增强阶段正文块回填测试均通过。
- 正文图片导出验证
  - 结果：正文图片 Markdown/HTML 渲染、正文图片 zip 下载、禁用图片时远程 URL 回退、X Article 详情页图片提取测试均通过。
  - 结果：完整验证通过，`npm test` 12 个测试文件、74 个测试通过；`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate`、`git diff --check` 均通过。

## 风险点

- X 页面 DOM 不稳定，后续可能导致解析器失效。
- X 原帖详情页正文增强依赖 X 页面 HTML 内嵌状态、DOM 和非激活详情页渲染，若 X 修改结构或不返回对应数据，可能回退到列表页正文或 X Article 标题/摘要。
- X Article 排版依赖 DOM 字体大小、粗细、列表符号和图片节点推断，只保证尽量保留阅读结构，不保证完全复刻 X 原站视觉。
- 外部文章全文抓取会引入更宽权限、跨站限制、反爬、付费墙和审核风险。
- Chrome Web Store 发布文案必须避免暗示“绕过 X 限制”“自动导出全部历史书签”“下载视频”。

## 下一步建议

1. 重新加载 `dist/` 中的插件，进行真实 Chrome 手动验收，并在 `tasks/todo.md` 中记录结果。
2. 外部文章全文抓取仍需单独设计后再决定，当前版本只增强 X 原帖正文。
