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
- `src/content/parseBookmarks.ts`
- `src/content/parseBookmarks.test.ts`
- `src/manifest.ts`
- `src/popup/i18n.ts`
- `src/popup/i18n.test.ts`
- `src/popup/main.ts`
- `src/popup/styles.css`
- `src/shared/types.ts`
- `src/shared/exportFormats.ts`
- `src/shared/exportFormats.test.ts`
- `src/shared/exportZip.ts`
- `src/shared/exportZip.test.ts`
- `src/shared/filenames.ts`
- `src/shared/filenames.test.ts`
- `src/shared/markdown.ts`
- `src/shared/markdown.test.ts`
- `src/test/fixtures/xBookmarkCard.ts`
- `tasks/todo.md`
- `tasks/lessons.md`
- `docs/codex-handoff.md`

## 当前未完成事项

- 真实 Chrome 插件手动验收仍未完全通过，`V2 Task 7` 保持打开状态。
- popup 错误文案仍需修复：
  - 切换到英文后，已有错误信息不会重新翻译。
  - “请先打开 X Bookmarks 页面”应直接给出 `https://x.com/i/bookmarks` 链接或按钮。
- 初始化状态仍需调整：
  - 当前打开 popup 时会通过 `GET_STATUS` 触发扫描，导致未开始采集时显示已采集数量。
  - 应改为未点击“开始采集”前显示 0。
- 采集停止逻辑仍需调整：
  - 当前停止条件偏激进，实际可能停在约 20 条。
  - 应改为手动停止，或确认列表到底且多轮页面高度不变后自动停止。
- “本次新增”指标仍需重新定义：
  - 当前表示最近一次 DOM 扫描新增数。
  - 对普通用户不清晰，建议改为“本轮新增”。
- X 正文增强采集未实现：
  - 当前主要采集列表页可见正文。
  - 若列表页只有链接或截断内容，单条 Markdown 可能缺少完整正文。
- 外部文章全文抓取未实现：
  - 需要更宽 host permissions、跨站请求处理和 Chrome Web Store 审核风险评估。
- `X Bookmarks Index.md` 标题和链接体验仍需优化：
  - 建议改成稳定 Markdown 链接。
  - 标题应优先使用链接卡片标题或推文第一行，并去掉换行、控制长度。

## 已跑过的命令和测试结果

- `npm install -D vite@^8.0.13 vitest@^4.1.6`
  - 结果：安装完成，`found 0 vulnerabilities`
- `npm audit --audit-level=moderate`
  - 结果：通过，`found 0 vulnerabilities`
- `npm test`
  - 结果：通过，7 个测试文件，43 个测试通过
- `npm run typecheck`
  - 结果：通过
- `npm run build`
  - 结果：通过，生成 `dist/`
- `npm ls vite vitest esbuild`
  - 结果：`vite@8.0.13`，`vitest@4.1.6`
- 本地 zip 结构验证
  - 结果：通过，样例 zip 包含 `X Bookmarks Index.md`、`bookmarks.json`、`bookmarks.csv`、`links.txt`、`bookmarks.html`、`media-manifest.json`、`export-report.json`、`bookmarks/`、`attachments/x-bookmarks/`
- Chrome 自动化验收
  - 结果：未完全通过。自动化确认真实 Chrome 中存在 `https://x.com/i/bookmarks` 标签页，但读取页面内容连续超时，未能完成 popup/end-to-end 自动验收。

## 风险点

- X 页面 DOM 不稳定，后续可能导致解析器失效。
- X Bookmarks 列表页可能只展示截断正文，影响 Markdown 内容完整性。
- 外部文章全文抓取会引入更宽权限、跨站限制、反爬、付费墙和审核风险。
- popup 当前状态模型仍混合“页面已加载数据”和“用户主动采集数据”，容易造成验收误解。
- Chrome Web Store 发布文案必须避免暗示“绕过 X 限制”“自动导出全部历史书签”“下载视频”。

## 下一步建议

1. 修复 popup 状态和文案问题：
   - 错误信息改为 localization key。
   - 错误提示加入 `https://x.com/i/bookmarks` 链接。
   - `GET_STATUS` 不再触发扫描。
   - 点击“开始采集”后才开始计数。
2. 调整采集循环：
   - 去掉 20 条左右的实际限制。
   - 改为手动停止或检测到底部后自动停止。
   - 将“本次新增”改为“本轮新增”。
3. 优化 Index：
   - 使用稳定 Markdown 链接指向 `bookmarks/*.md`。
   - 标题去换行、限长，并优先使用链接卡片标题。
4. 评估正文增强采集：
   - 先做 X 原帖详情页增强采集。
   - 外部文章全文抓取放在单独设计之后再决定。
5. 重新进行真实 Chrome 手动验收，并在 `tasks/todo.md` 中记录结果。
