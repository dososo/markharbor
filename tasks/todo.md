# MarkHarbor Todo

## Current Goal

Build a simple, convenient Chrome extension for exporting X Bookmarks into an Obsidian-friendly knowledge base format.

## Assumptions

- Target users want speed and ease of use more than perfect full-history archival in the first version.
- The first version works from the user's own logged-in X Bookmarks page.
- The extension does not upload bookmark data to a server.
- Video content is exported as source post links plus available preview metadata, not downloaded as video files in v1.
- Obsidian integration means generating Markdown files and asset folders that can be placed in an Obsidian vault.

## Tasks

- [x] Clarify target platform: X / Twitter Bookmarks.
- [x] Clarify product shape: public user-facing tool, likely Chrome extension.
- [x] Clarify media boundary: images can be exported/downloaded; videos can be linked/previewed in v1.
- [x] Confirm export scope: guided in-page collection that assists loading more bookmarks, without background scraping or hidden API access.
- [x] Confirm Obsidian format: support both one note per bookmark and one combined export file, selectable at export time.
- [x] Propose 2-3 implementation approaches with trade-offs.
- [x] Present MVP design for approval.
- [x] Write approved design spec under `docs/superpowers/specs/`.
- [x] Task 1: Create project config files. Verification: config files exist and match the approved scaffold.
- [x] Task 1: Create Vite build config. Verification: build emits popup and content entries.
- [x] Task 1: Create extension manifest and placeholder entries. Verification: manifest references `index.html` and `assets/content.js`.
- [x] Task 1: Install dependencies. Verification: `npm install` completes and writes `package-lock.json`.
- [x] Task 1: Typecheck and build. Verification: `npm run typecheck` and `npm run build` pass.
- [x] Task 1: Commit scaffold. Verification: commit message is `chore: scaffold chrome extension project`.
- [x] Task 2: Write dedupe tests. Verification: `npm test -- src/shared/dedupe.test.ts` fails before implementation.
- [x] Task 2: Create shared bookmark types. Verification: `src/shared/types.ts` exports planned interfaces.
- [x] Task 2: Implement merge dedupe. Verification: dedupe test passes.
- [x] Task 2: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 2: Commit shared types and dedupe. Verification: commit message is `feat: add bookmark types and dedupe`.
- [x] Task 3: Add X bookmark card fixture. Verification: parser test can load representative X card HTML.
- [x] Task 3: Write DOM bookmark parser test. Verification: `npm test -- src/content/parseBookmarks.test.ts` fails before implementation.
- [x] Task 3: Implement DOM bookmark parser. Verification: parser test passes.
- [x] Task 3: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 3: Commit parser. Verification: commit message is `feat: parse loaded x bookmark cards`.
- [x] Task 4: Write filename and Markdown rendering tests. Verification: target tests fail before implementation.
- [x] Task 4: Implement filename helpers and Markdown renderers. Verification: target tests pass.
- [x] Task 4: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 4: Commit rendering helpers. Verification: commit message is `feat: render obsidian markdown exports`.
- [x] Task 5: Write failing zip export tests. Verification: `npm test -- src/shared/exportZip.test.ts` fails before implementation.
- [x] Task 5: Implement zip export builder. Verification: zip includes JSON, combined Markdown, per-bookmark Markdown, and optional image attachments.
- [x] Task 5: Run zip tests. Verification: `npm test -- src/shared/exportZip.test.ts` passes.
- [x] Task 5: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 5: Commit zip export. Verification: commit message is `feat: build local export zip`.
- [x] Task 6: Add popup/content message contracts. Verification: `src/shared/messages.ts` exports required types.
- [x] Task 6: Implement content script collection loop. Verification: content script handles status, start, stop, clear, off-page, and unknown messages.
- [x] Task 6: Typecheck and test. Verification: `npm run typecheck` and `npm test` pass.
- [x] Task 6: Commit content collection loop. Verification: commit message is `feat: collect bookmarks from content script`.
- [x] Task 7: Implement popup collection and export controls. Verification: popup can send start, stop, clear, status, and export actions.
- [x] Task 7: Add image download host permission. Verification: manifest includes `https://pbs.twimg.com/*` for X media attachments.
- [x] Task 7: Typecheck, test, and build. Verification: `npm run typecheck`, `npm test`, and `npm run build` pass.
- [x] Task 8: Add README usage and privacy documentation. Verification: README explains local development, usage, privacy, export contents, and manual validation.
- [x] V2 planning: Write productization design spec. Verification: `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md` covers export formats, Obsidian structure, attachments, competitor insights, visual direction, i18n, README, and success criteria.
- [x] V2 planning: Write implementation plan. Verification: `docs/superpowers/plans/2026-05-16-x-bookmarks-v2-productization.md` breaks work into testable tasks with file paths and verification steps.
- [x] V2 Task 1: Enrich bookmark data model and parser. Verification: parser tests cover visible link card metadata and typecheck passes.
- [x] V2 Task 2: Add export format renderers. Verification: CSV, TXT, HTML, media manifest, and export report tests pass.
- [x] V2 Task 3: Upgrade Markdown and attachment structure. Verification: Markdown tests prove useful Obsidian notes, index links, and per-bookmark attachment paths.
- [x] V2 Task 4: Package V2 zip with traceable media. Verification: zip tests prove V2 file structure, media manifest, export report, and local media references.
- [x] V2 Task 5: Add bilingual popup and expressive UI. Verification: i18n tests, typecheck, and build pass; locale files are copied to `dist/`.
- [x] V2 Task 6: Complete README and user documentation. Verification: README covers install, usage, formats, Obsidian workflow, privacy, limits, testing, publishing, FAQ, and English Quick Start.
- [ ] V2 Task 7: Full verification, live browser test, and audit. Verification: automated checks, security audit result, local zip validation, and Chrome live validation limits are recorded; final acceptance still requires manual Chrome checklist pass.
- [x] V2 Task 7 P0-1：修复错误文案状态模型。验证：错误状态保存本地化 key，切换中文/英文后当前错误提示会随语言重新渲染。
- [x] V2 Task 7 P0-2：错误提示加入 X Bookmarks 入口。验证：不在 X Bookmarks 页面时，popup 显示可点击的 `https://x.com/i/bookmarks` 链接或按钮。
- [x] V2 Task 7 P0-3：修复初始化状态。验证：打开 popup 但未点击“开始采集”前显示 0，`GET_STATUS` 不触发扫描。
- [x] V2 Task 7 P0-4：把“本次新增”改为“本轮新增”。验证：指标表示从点击开始采集到当前新增的累计数量，而不是最近一次 DOM 扫描增量。
- [x] V2 Task 7 P0-5：放宽采集停止逻辑。验证：采集优先由用户手动停止，自动停止只在确认到底且多轮页面高度不变后发生。
- [x] V2 Task 7 P0-6：优化 `X Bookmarks Index.md` 链接和标题策略。验证：索引用稳定 Markdown 链接指向 `bookmarks/*.md`，标题优先链接卡片标题，其次推文首行，并去换行、限长。
- [x] V2 Task 7 P0 验证：运行 `npm test`、`npm run typecheck`、`npm run build`，并记录真实 Chrome checklist 仍需用户手动验收。
- [x] V2 Task 7 P2-1：实现 X 原帖详情页正文增强采集。验证：列表页正文为空或截断时，content script 会请求同源原帖详情页并用详情页正文补齐单条书签。
- [x] V2 Task 7 P2-2：记录正文增强状态。验证：每条书签能区分 `not-needed`、`success`、`failed`，失败时保留列表页可见正文，不阻断采集。
- [x] V2 Task 7 P2-3：导出正文增强信息。验证：单条 Markdown、CSV、HTML、JSON 能显示增强后的正文，并记录正文来源/状态。
- [x] V2 Task 7 P2-4：控制性能和风险边界。验证：每轮只增强本轮新增书签；同一 URL 不重复请求；请求失败、非 HTML、解析不到正文时安全回退。
- [x] V2 Task 7 P2 验证：按 TDD 跑新增目标测试，再跑 `npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate`。

## Review

Chinese design spec written at `docs/superpowers/specs/2026-05-16-markharbor-design.md`.
Self-review found no placeholders or obvious contradictions. No implementation has started.

Implementation plan created at `docs/superpowers/plans/2026-05-16-markharbor.md`.
Next step is user approval of execution mode before code implementation.

Task 1 scaffold completed:
- Created TypeScript, Vite, Vitest, popup, manifest, and content script scaffold.
- `npm install` completed and created `package-lock.json`.
- `npm run typecheck` passed.
- `npm run build` passed and generated `dist/manifest.json`.
- `npm install` reported 5 moderate audit findings in transitive dependencies; no dependency versions were changed outside the approved scaffold.

Task 2 shared types and dedupe completed:
- Added `XBookmarkVideo`, `XBookmark`, and `CollectionState` shared interfaces.
- Added `mergeBookmarks` with id-first and normalized-url fallback deduplication.
- Confirmed `npm test -- src/shared/dedupe.test.ts` fails before implementation and passes after implementation.
- `npm run typecheck` passed.

Task 3 DOM bookmark parser completed:
- Added representative X bookmark card fixture and parser test.
- Confirmed `npm test -- src/content/parseBookmarks.test.ts` failed before implementation because `parseBookmarks` did not exist.
- Implemented DOM parsing for loaded tweet articles, canonical X status URLs, author fields, tweet text, posted time, media image URLs, video preview metadata, and raw article text.
- `npm test -- src/content/parseBookmarks.test.ts` passed.
- `npm run typecheck` passed.

Task 4 Markdown and filename rendering completed:
- Added tests for safe filenames, bookmark filenames, image filenames, combined Markdown, per-bookmark front matter, YAML escaping, and image URL fallback.
- Confirmed `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts` failed before implementation because the modules did not exist.
- Implemented filename helpers and Markdown renderers for Obsidian-oriented exports.
- `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts` passed.
- `npm run typecheck` passed.

Task 5 zip export completed:
- Added `buildExportZip` for JSZip packages containing `bookmarks.json`, combined Markdown, per-bookmark Markdown files, and optional image attachments.
- Confirmed `npm test -- src/shared/exportZip.test.ts` failed before implementation because `src/shared/exportZip.ts` did not exist.
- Added coverage for includeImages false, unique image fetching, successful local attachment paths, undefined image fetch results, and rejected image fetch fallback.
- `npm test -- src/shared/exportZip.test.ts` passed.
- `npm run typecheck` passed.

Task 6 content collection loop completed:
- Added popup/content message contracts in `src/shared/messages.ts`.
- Replaced the content script placeholder with an in-memory collection state, X bookmarks page guard, scan/merge loop, smooth scrolling, stop/clear handling, and unknown-operation error response.
- `npm run typecheck` passed.
- `npm test` passed.

Task 7 popup UI and downloads completed:
- Added popup controls for start, stop, clear, image attachment toggle, and zip export.
- Added status refresh while collection is running.
- Added zip download via Chrome downloads API.
- Added `https://pbs.twimg.com/*` host permission so image attachments from X media can be fetched.
- `npm run typecheck`, `npm test`, and `npm run build` passed.

Task 8 README and verification checklist completed:
- Added local development instructions.
- Documented privacy boundaries: no cloud account, no upload, no cookie access, no internal X API calls, no video downloads in v1.
- Documented usage and expected zip contents.
- Added manual validation checklist.

Implementation plan execution note:
- Execution started with subagent-driven development.
- After subagent usage limits were reached, remaining work continued inline using the approved plan and the same verification standards.

Live Chrome acceptance test completed:
- Loaded the unpacked extension from `dist/` in Chrome.
- Opened an authenticated X Bookmarks page at `https://x.com/i/bookmarks`.
- Verified the popup initially detected 4 loaded bookmarks.
- Ran guided collection once and verified it collected 20 bookmarks after 12 scroll attempts.
- Exported a zip from Chrome downloads and verified it contained JSON, combined Markdown, per-bookmark Markdown files, and image attachments.
- Found a real extraction issue with non-ASCII per-bookmark filenames, fixed it by switching export filenames to portable ASCII-safe slugs, rebuilt, reloaded the extension, and re-exported.
- Verified the fixed zip extracts with the system `unzip` command and preserves Chinese content inside Markdown/JSON.
- Current security audit status: resolved in V2 follow-up by upgrading `vite` to `^8.0.13` and `vitest` to `^4.1.6`; `npm audit --audit-level=moderate` reports 0 vulnerabilities.

V2 planning completed:
- Productization design spec written at `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md`.
- Implementation plan written at `docs/superpowers/plans/2026-05-16-x-bookmarks-v2-productization.md`.
- V2 scope prioritizes Obsidian usefulness, traceable attachments, CSV/TXT/HTML outputs, bilingual UI, expressive popup polish, and complete README documentation.
- No feature code was changed during V2 planning.

V2 implementation completed:
- Added visible link card parsing for X bookmark cards.
- Added JSON backup plus CSV, TXT, HTML, media manifest, and export report renderers.
- Upgraded Obsidian Markdown with index, richer YAML, source sections, link card sections, media sections, and a user note area.
- Reworked zip packaging so images are saved under per-bookmark attachment folders and media status is traceable.
- Added Chinese/English popup language switching and Chrome manifest locale files.
- Restyled popup with a compact, brighter, Google I/O inspired utility interface.
- Replaced MVP README with complete Chinese documentation and English Quick Start.

V2 verification:
- `npm test` passed: 7 files, 41 tests.
- `npm run typecheck` passed.
- `npm run build` passed.
- `dist/_locales/en/messages.json` and `dist/_locales/zh_CN/messages.json` were generated.
- Local zip validation passed: generated zip contains `X Bookmarks Index.md`, `bookmarks.json`, `bookmarks.csv`, `links.txt`, `bookmarks.html`, `media-manifest.json`, `export-report.json`, `bookmarks/`, and `attachments/x-bookmarks/`; the sample note includes local image references and the expected Obsidian sections.
- `npm audit --audit-level=moderate` passed after upgrading the vulnerable Vite/Vitest development dependency chain; audit now reports 0 vulnerabilities.
- Dependency upgrade verification passed with `vite@8.0.13`, `vitest@4.1.6`, and `@types/node@20.19.41`.
- Chrome live validation was attempted through the real Chrome profile. Chrome automation confirmed an `https://x.com/i/bookmarks` tab existed, but reading page contents timed out twice, so popup/end-to-end live interaction is not marked as fully passed in this run.
- Final acceptance remains open until the manual Chrome checklist passes on the user's machine.

V2 attachment filename follow-up:
- Fixed X media URLs that store file type in query parameters, such as `/media/<id>?format=jpg&name=large`, so exported attachments now include image extensions like `.jpg` or `.png`.
- Added tests for extensionless X media paths and zip integration using query-based media formats.
- Image attachments are written with normal file permissions in the zip.
- Verification passed: `npm test` now reports 7 files and 43 tests, `npm run typecheck` passed, `npm run build` passed, and `npm audit --audit-level=moderate` reports 0 vulnerabilities.

V2 Task 7 P0 修复完成：
- 新增项目级 `AGENTS.md`，并同步全局中文工作流要求。
- 将 `tasks/lessons.md` 改为中文，并记录 AGENTS 搜索范围和全流程中文要求。
- popup 错误状态改为本地化 key，语言切换后当前错误提示会重新翻译。
- 不在 X Bookmarks 页面时，popup 错误区显示 `https://x.com/i/bookmarks` 入口。
- content 采集逻辑拆出可测试 controller，`GET_STATUS` 不再触发扫描。
- 新增 `runAdded` 作为“本轮新增”，popup 不再展示最近一次 DOM 扫描增量。
- 采集循环不再因为连续 idle scan 过早停止，改为手动停止优先，自动停止仅在到底且页面高度多轮稳定后发生，并保留高安全上限防死循环。
- `X Bookmarks Index.md` 改为标准 Markdown 链接，标题优先链接卡片标题，其次推文第一行，并去换行、限长。
- CSV/HTML 补充链接卡片描述字段；JSON 已保留原始 `linkCard` 数据。
- 新增 `src/content/collection.test.ts` 和 `src/popup/main.test.ts`，补充 Markdown/export format 回归测试。
- 验证通过：`npm test` 9 个测试文件、50 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞。
- `V2 Task 7` 总任务仍保持打开，原因是真实 Chrome 手动 checklist 尚需用户确认。

V2 Task 7 P2 原帖正文增强完成：
- 新增 `src/content/enrichText.ts`，对本轮新增书签请求同源 X 原帖详情页，并解析匹配原帖的详情页正文。
- 根据真实 X HTML 验证，原帖静态 HTML 常包含 `window.__INITIAL_STATE__`，其中 `tweets.entities[ID].full_text` 比 DOM 解析更适合补齐正文；已改为优先解析该状态，DOM 解析作为兜底。
- 修复开始采集时未清空 content script 残留状态的问题；每次点击“开始采集”都会从干净状态开始，避免旧的空正文书签被判定为已存在而跳过正文增强。
- 详情页正文更完整时，将单条书签正文替换为详情页正文，并记录 `textSource: "post-detail"` 与 `textEnhancementStatus: "success"`。
- 请求失败、非 HTML、解析不到匹配原帖或详情页正文不更完整时，保留列表页正文，并记录 `failed` 或 `not-needed`。
- 采集器只增强本轮新增书签，同一 URL 不重复请求；增强后的正文会缓存，避免后续列表页扫描把长正文覆盖回短正文。
- Markdown front matter、Markdown 来源区、CSV 和 HTML 均输出正文来源和增强状态；JSON 自动保留新增字段。
- README 已补充 X 原帖正文增强边界：只补 X 原帖，不抓外部文章全文。
- 验证通过：`npm test` 10 个测试文件、58 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞。
- `V2 Task 7` 总任务仍保持打开，原因是真实 Chrome 手动 checklist 尚需用户确认。

已打开 X Bookmarks 页面自动识别修复完成：
- manifest 增加 `scripting` 权限。
- popup 先向当前标签页发送消息；如果接收端不存在，且当前 URL 是 `https://x.com/i/bookmarks`，则自动注入 `assets/content.js` 并重试消息。
- 新增 `src/manifest.test.ts` 和 popup 回归测试，覆盖已打开页面自动注入场景。
- 用户不再需要因为 content script 未注入而手动刷新 X Bookmarks 页面。

X Article 正文增强执行计划：
- [x] Article P0-1：补充 X Article 卡片预览解析测试。验证：`tweetText` 为空但卡片包含标题和摘要时，`parseBookmarksFromDocument` 返回可见正文。
- [x] Article P0-2：补充后台详情页增强测试。验证：正文为空或只有预览时，后台打开非激活 X 详情页读取渲染后的 Article 完整正文并回传。
- [x] Article P0-3：实现 X Article 卡片预览解析。验证：单条 Markdown、CSV、HTML、JSON 不再只显示“未采集到可见正文”。
- [x] Article P0-4：实现 background service worker 详情页增强。验证：采集长文时能安全回填完整正文，失败时保留卡片预览并标记失败。
- [x] Article P0-5：更新 README、handoff 和 lessons。验证：明确说明只增强 X 原帖/Article，不默认抓外部网站全文。
- [x] Article P0-6：跑完整验证。验证：`npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate` 全部通过。

X Article 正文增强完成：
- 列表页 `tweetText` 为空但存在 X Article 卡片时，采集器现在会提取文章标题和摘要作为书签正文，并保存到 `article.title` / `article.preview`。
- 新增 background service worker，用户触发采集后会打开非激活 X 原帖详情页，等待渲染后读取普通推文正文或 X Article 完整正文，完成后关闭详情页。
- `enhanceBookmarkText` 对 X Article、空正文、以省略号结尾或列表页显示“显示更多”的书签优先请求渲染详情页；成功后标记 `textSource: "post-detail"` 与 `textEnhancementStatus: "success"`。
- Markdown front matter、`## X 文章`、CSV、HTML、JSON 均保留 X Article 标题和摘要；Index 标题也会优先使用 X Article 标题。
- 不抓外部网站全文，外部链接仍只保留 X 页面可见的链接卡片信息。
- 验证通过：`npm test` 12 个测试文件、66 个测试通过；`npm run typecheck` 通过；`npm run build` 通过并生成 `dist/assets/background.js`；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

正文排版格式化执行计划：
- [x] Format P0-1：补充单条 Markdown 结构化正文测试。验证：`## 原文` 下保留段落、小标题、列表和加粗格式，符合 Obsidian Markdown。
- [x] Format P0-2：补充 HTML 语义正文测试。验证：HTML 使用 `<h2>`、`<h3>`、`<p>`、`<ul><li>` 渲染正文，而不是整段塞进一个 `<p>`。
- [x] Format P0-3：补充渲染详情页正文块提取测试。验证：X Article 详情页可提取标题、段落、小标题、列表项和加粗片段。
- [x] Format P0-4：实现 `contentBlocks` 数据结构和渲染器。验证：Markdown 和 HTML 从同一套正文块生成，纯文本作为 fallback。
- [x] Format P0-5：更新 README、handoff 和任务记录。验证：说明导出会尽量保留 X Article 的可读排版，失败时安全回退纯文本。
- [x] Format P0-6：跑完整验证。验证：`npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate`、`git diff --check` 全部通过。

正文排版格式化完成：
- 新增 `contentBlocks`，用于保存标题、段落、列表等正文块；Markdown 和 HTML 共用这套结构渲染。
- 单条 Markdown 的 `## 原文` 会优先输出结构化 Markdown，支持 `##`、`###`、段落、列表和 `**加粗**`。
- HTML 导出会把正文渲染为 `<h2>`、`<h3>`、`<p>`、`<ul><li>`，并把 `**加粗**` 转成 `<strong>`。
- X Article 详情页读取会尽量根据 DOM、字体大小、粗细和列表符号推断正文块；识别失败时保留纯文本回退。
- `enhanceBookmarkText` 会在正文增强成功时保留后台返回的 `contentBlocks`，避免导出阶段丢失排版。
- 验证通过：`npm test` 12 个测试文件、70 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

正文图片按原文顺序导出执行计划：
- [x] Image P0-1：补充正文图片 Markdown/HTML 渲染测试。验证：正文块中的图片按原文顺序出现在 `## 原文` 中，Markdown 使用本地附件路径，HTML 显示 `<img>`。
- [x] Image P0-2：补充 zip 下载正文图片测试。验证：只出现在 `contentBlocks` 的图片也会下载、写入 `media-manifest.json`，并映射回 Markdown/HTML。
- [x] Image P0-3：补充 X Article 详情页图片提取测试。验证：正文 DOM 中的 `pbs.twimg.com/media` 图片会生成 image block，且顺序夹在段落之间。
- [x] Image P0-4：实现 image content block、正文图片收集、下载和渲染。验证：封面图和正文配图都能展示；失败时保留远程 URL。
- [x] Image P0-5：更新 README、handoff 和任务记录。验证：说明正文图片会按正文顺序展示，下载失败会回退远程链接。
- [x] Image P0-6：跑完整验证。验证：`npm test`、`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate`、`git diff --check` 全部通过。

正文图片按原文顺序导出完成：
- `contentBlocks` 新增 image block，正文图片会和段落、标题、列表一起按顺序渲染。
- 单条 Markdown 的 `## 原文` 中会输出正文图片；下载成功时使用 `../attachments/...` 本地路径，下载失败或未启用图片时保留远程 URL。
- HTML 正文会输出 `<figure><img ... /></figure>`；封面图、链接卡片图和其它媒体图也会显示。
- zip 打包会扫描 `contentBlocks` 里的图片 URL，只出现在正文块中的图片也会下载、写入 `media-manifest.json`，并映射回 Markdown/HTML。
- X Article 详情页提取会识别正文中的 `pbs.twimg.com/media` 图片，并保持它在正文块里的原始顺序。
- 验证通过：`npm test` 12 个测试文件、74 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

正文图片未出现在原文中的回归修复执行计划：
- [x] Image Regression P0-1：补充增强层回归测试。验证：详情页文字不比列表页更长、但详情页 `contentBlocks` 含图片时，仍采用详情页结构化正文。
- [x] Image Regression P0-2：修复增强判定和普通推文图片正文块。验证：图片块不会因为纯文本长度相同而被丢弃；普通推文媒体图也能进入 `contentBlocks`，Markdown/HTML 导出能拿到按顺序穿插的 image block。
- [x] Image Regression P0-3：补充经验记录。验证：`tasks/lessons.md` 记录“正文结构比纯文本长度更重要”的规则。
- [x] Image Regression P0-4：跑完整验证。验证：目标测试、全量测试、类型检查、构建、审计和 diff 空白检查全部通过。

正文图片未出现在原文中的回归修复完成：
- 根因是增强层只用“详情页纯文本是否更长”判断是否采用详情页结果；当详情页文字长度相同但 `contentBlocks` 多了正文图片时，图片块会被丢弃。
- 已修复增强判定：详情页 `contentBlocks` 出现列表页没有的新正文图片时，也视为增强成功并保留结构化正文。
- 普通推文列表页解析和详情页解析现在都会把 `pbs.twimg.com/media/*` 图片作为 image block 放到正文块中，默认排在推文正文之后。
- 单条 Markdown 的 `## 原文` 会内联这些图片；已经内联的图片不会再在 `## 媒体` 区重复展示。
- 验证通过：`npm test` 12 个测试文件、78 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

X Article 正文配图仍只显示封面图的回归修复执行计划：
- [x] Article Image P0-1：补充真实 X Article read view DOM 回归测试。验证：`twitterArticleReadView` / `twitterArticleRichTextView` 内的 `tweetPhoto` 图片会按正文顺序进入 `contentBlocks`。
- [x] Article Image P0-2：补充详情页轮询测试。验证：X Article 详情页早期只返回封面/标题时不会提前结束，等 rich text 正文和正文图片加载后再返回。
- [x] Article Image P0-3：实现 read view 优先解析和完整性判断。验证：正文配图不再只剩封面图，失败时仍保留安全回退。
- [x] Article Image P0-4：优化采集滚动体感。验证：开始采集后首轮扫描完成即可滚动，正文增强在后台执行，采集结束前等待增强收口。
- [x] Article Image P0-5：同步版本号。验证：`package.json`、`package-lock.json`、`src/manifest.ts` 同步升补丁版本。
- [x] Article Image P0-6：记录经验并跑完整验证。验证：测试、类型检查、构建、审计和 diff 空白检查通过。

X Article 正文配图仍只显示封面图的回归修复完成：
- 通过真实 Chrome DOM 只读检查确认，X Article 正文配图位于 `twitterArticleReadView` / `twitterArticleRichTextView` / `longformRichTextComponent` 下的 `tweetPhoto` 节点，不能按普通 `tweetText` 或列表卡片路径提取。
- 后台详情页增强现在优先解析 X Article rich text 正文区域，正文配图会作为 image block 按原文顺序穿插到 `contentBlocks`。
- 详情页轮询不会在只拿到标题、摘要或封面图时提前返回；X Article 会等 rich text 正文完整后再返回，末次尝试仍保留安全回退。
- 采集循环改为扫描后立即滚动，正文增强后台排队执行；自动采集收尾前等待增强结果，减少点击“开始采集”后列表页长时间不动的体感问题。
- 版本号已从 `0.1.1` 升到 `0.1.2`。
- 验证通过：`npm test` 12 个测试文件、81 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过；`dist/manifest.json` 版本为 `0.1.2`。

X Article 正文图片懒加载回归修复执行计划：
- [x] Lazy Image P0-1：补充“rich text 已出现但页面未滚到底时不能标记完成”的失败测试。验证：详情页提取会返回 `isComplete: false` 并触发滚动。
- [x] Lazy Image P0-2：补充嵌套背景图测试。验证：`tweetPhoto` 内层 `background-image` 里的 `pbs.twimg.com/media` 图片也会进入 image block。
- [x] Lazy Image P0-3：实现详情页滚动等待。验证：X Article 详情页不会因为文字先出现就提前结束，会继续滚动触发正文图片懒加载。
- [x] Lazy Image P0-4：同步版本号到 `0.1.3`。验证：`package.json`、`package-lock.json`、`src/manifest.ts` 和构建产物版本一致。
- [x] Lazy Image P0-5：跑完整验证。验证：目标测试、全量测试、类型检查、构建、审计和 diff 空白检查全部通过。

X Article 正文图片懒加载回归修复记录：
- 根因补充：上一版只等到了 `twitterArticleRichTextView` 文字区域，但 X Article 正文深处图片是懒加载的；文字区域出现不代表正文图片节点已经进入 DOM，所以增强结果仍可能只有封面图。
- 修复策略：如果 rich text 已出现但详情页还没滚到底，提取结果标记为未完成并在非激活详情页内继续滚动；后台轮询会继续等待后续 DOM 更新。
- 兼容补强：正文图片可能不是直接 `<img>`，而是 `tweetPhoto` 内层元素的 `background-image`；提取逻辑现在会查找后代元素样式中的 `pbs.twimg.com/media`。
- 版本号已从 `0.1.2` 升到 `0.1.3`，`dist/manifest.json` 版本确认为 `0.1.3`。
- 验证通过：`npm test` 12 个测试文件、83 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

X Article 激活详情页采集修复执行计划：
- [x] Active Detail P0-1：只读审计最新导出包。验证：`bookmarks.json` 中增强成功的 X Article 仍有 0 个正文 image block，确认问题在采集层。
- [x] Active Detail P0-2：用真实 Chrome 检查目标 Article。验证：可见详情页中 `twitterArticleRichTextView` 内能看到多张 `pbs.twimg.com/media` 正文图。
- [x] Active Detail P0-3：补充 Article 详情页需激活打开的失败测试。验证：X Article 调用 `chrome.tabs.create` 时必须 `active: true`，完成后恢复书签页。
- [x] Active Detail P0-4：补充增强队列限流测试。验证：详情增强一次只跑一个，避免多个激活标签页同时抢焦点。
- [x] Active Detail P0-5：实现激活采集和串行增强。验证：普通推文仍可非激活采集，X Article 使用激活标签页以触发完整正文图片渲染。
- [x] Active Detail P0-6：同步版本并跑完整验证。验证：版本升到 `0.1.4`，目标测试、全量测试、类型检查、构建、审计和 diff 空白检查全部通过。

X Article 激活详情页采集修复记录：
- 根因补充：非激活详情页能拿到 X Article 文字，但可能不完整渲染内联图片；真实可见标签页打开同一文章时，正文 rich text 内可直接看到 20 多张正文图。
- 修复策略：X Article 详情增强改为短暂激活详情页读取，读取后恢复原书签页；普通推文仍保持非激活读取。
- 体验控制：详情增强队列改为串行处理，避免同时打开多个激活详情页造成标签页焦点混乱。
- 版本号已从 `0.1.3` 升到 `0.1.4`，`dist/manifest.json` 版本确认为 `0.1.4`。
- 验证通过：`npm test` 12 个测试文件、85 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

完整正文配图高级模式稳定化执行计划：
- [x] Stable Advanced P0-1：反向锁定严重回归。验证：高级模式不能再 `active: true` 打开文章标签页，不能关闭 popup 主流程。
- [x] Stable Advanced P0-2：实现非聚焦采集窗口。验证：X Article 高级模式通过 `chrome.windows.create({ focused: false })` 打开采集载体，读取完成后关闭窗口。
- [x] Stable Advanced P0-3：实现一篇完成再下一篇。验证：当前详情增强完成前，书签列表页不滚动到下一批。
- [x] Stable Advanced P0-4：修复停止语义。验证：点击停止会清空待增强队列，不再继续打开后续文章采集载体。
- [x] Stable Advanced P0-5：增加 popup 状态展示。验证：popup 显示当前阶段和正在采集的标题/摘要，并提供“完整正文配图高级模式”开关。
- [x] Stable Advanced P0-6：同步版本并验证。验证：版本升到 `0.1.5`，目标测试、全量测试、类型检查、构建、审计和 diff 空白检查全部通过。

完整正文配图高级模式稳定化记录：
- 彻底撤掉 `0.1.4` 的激活标签页方案；该方案会导致 Chrome popup 关闭，用户无法稳定停止、观察和导出。
- 高级模式默认开启，但通过非聚焦采集窗口执行，不抢走当前书签页活动标签；普通推文仍用非激活标签页读取。
- 采集循环改为“扫描当前可见书签 -> 串行增强当前批次 -> 再滚动下一批”，确保一篇完成再进入下一篇。
- `STOP_COLLECTION` 会立即清空待增强队列并标记 `stopped`，当前已开始的一篇会自然收口，但不会再打开后续文章。
- popup 现在展示当前采集阶段和当前书签标题，便于发布前手动验收。
- 版本号已从 `0.1.4` 升到 `0.1.5`，`dist/manifest.json` 版本确认为 `0.1.5`。
- 验证通过：`npm test` 12 个测试文件、86 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

书签列表滚动与采集节奏匹配执行计划：
- [x] Scroll Sync P0-1：补充回归测试。验证：一个书签增强完成后立即滚动一次，不等待当前可见批次全部增强完成。
- [x] Scroll Sync P0-2：调整增强队列调度。验证：每轮只处理一条待增强书签，滚动后继续处理下一条。
- [x] Scroll Sync P0-3：保持停止语义。验证：停止后清空剩余队列，不再继续开后续采集载体。
- [x] Scroll Sync P0-4：同步版本并跑完整验证。验证：版本升到 `0.1.6`，测试、类型检查、构建、审计和 diff 空白检查全部通过。

书签列表滚动与采集节奏匹配记录：
- 根因：`0.1.5` 会扫描当前可见批次并把整批全部增强完才滚动，完整正文配图耗时较长时，书签列表长时间静止，体感像没有推进。
- 修复：增强队列保留已发现书签，但每个采集循环只处理一条；当前条目完成后先滚动列表，再进入下一条。
- 版本号已从 `0.1.5` 升到 `0.1.6`，`dist/manifest.json` 版本确认为 `0.1.6`。
- 验证通过：`npm test` 12 个测试文件、87 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

X Article 正文快照累积与目标锁定执行计划：
- [x] Snapshot P0-1：审计最新导出包。验证：确认缺失发生在采集入库层，且存在误采非目标正文的样例。
- [x] Snapshot P0-2：补充跨滚动快照累积失败测试。验证：多个虚拟化 DOM 快照中的段落和图片会按锚点合并，而不是只保留最后一次快照。
- [x] Snapshot P0-3：补充目标锁定失败测试。验证：只有回复/推荐内容含目标链接时，不应把它当作目标正文。
- [x] Snapshot P0-4：实现最小修复。验证：X Article 详情页采集按快照累积正文块，并用目标标题/时间链接收紧匹配。
- [x] Snapshot P0-5：同步版本并更新记录。验证：版本升到 `0.1.7`，交接文档和经验记录写清楚边界。
- [x] Snapshot P0-6：跑完整验证。验证：目标测试、全量测试、类型检查、构建、审计和 diff 空白检查全部通过。

X Article 正文快照累积与目标锁定记录：
- 最新导出包确认问题在采集入库层：部分 `post-detail success` 条目正文只有十几字或采到不相关英文内容，正文图片块也缺失，不是 Markdown/HTML 渲染阶段单独丢图。
- 根因一：X Article 长文随滚动虚拟化，详情页每次读取只看到当前挂载片段；旧实现用最后一次 DOM 快照覆盖前文，导致已滚过的正文和图片丢失。
- 根因二：目标帖匹配过宽，只要某个回复/推荐里有目标状态链接就可能被误当作目标正文。
- 修复：后台详情页增强会按快照锚点累积 `contentBlocks`，新段落和图片插到相邻已知块附近，最后由累计正文块生成文本。
- 修复：详情页注入时传入 Article 标题；匹配目标时优先看时间链接状态 ID 和标题，不再从整页兜底抓任意 `twitterArticleReadView`。
- 修复：列表页已知封面图不会再混入 X Article 的正文块，避免封面图在 `## 原文` 中重复冒充正文配图。
- 版本号已从 `0.1.6` 升到 `0.1.7`，`dist/manifest.json` 版本确认为 `0.1.7`。
- 验证通过：`npm test` 12 个测试文件、89 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

采集启动可感知性优化执行计划：
- [x] Feedback P0-1：补充启动滚动反馈测试。验证：点击开始后首轮扫描完成即滚动一次，不等待慢速正文增强。
- [x] Feedback P0-2：补充 popup 采集中视觉状态测试。验证：采集中显示明显进度卡和工作提示。
- [x] Feedback P0-3：实现最小交互修复。验证：初始滚动不跳过当前可见书签，后续采集仍按节奏推进。
- [x] Feedback P0-4：同步版本并更新记录。验证：版本升到 `0.1.8`。
- [x] Feedback P0-5：跑完整验证并提交。验证：测试、类型检查、构建、审计和 diff 空白检查全部通过。

采集启动可感知性优化记录：
- 根因：完整正文配图增强耗时较长时，旧流程会先等待第一条详情增强完成再滚动列表，点击“开始采集”后页面长时间静止，用户感知弱。
- 修复：开始采集后先扫描当前可见书签并入队，然后立即滚动一次作为启动反馈；已扫描到的当前可见书签不会丢，后续仍按一条增强后推进的节奏继续。
- 修复：popup 采集中进度卡增加高亮、脉冲点和“采集中，请保持 X Bookmarks 页面打开。”提示，当前采集标题仍继续展示。
- 版本号已从 `0.1.7` 升到 `0.1.8`，`dist/manifest.json` 版本确认为 `0.1.8`。
- 验证通过：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

采集计数语义澄清执行计划：
- [x] Count P0-1：补充状态模型测试。验证：点击开始后“已发现/本轮发现”可立即增长，但详情增强完成数单独统计。
- [x] Count P0-2：补充 popup 文案测试。验证：主统计显示“已发现”“本轮发现”“详情完成 0/0 或 1/4”，不再显示“已采集”。
- [x] Count P0-3：实现详情增强进度状态。验证：每个入队详情增强增加总数，完成或安全回退后增加完成数。
- [x] Count P0-4：同步版本和记录。验证：版本升到 `0.1.9`，交接文档和 lessons 说明计数语义。
- [x] Count P0-5：跑完整验证并提交。验证：测试、类型检查、构建、审计和 diff 空白检查全部通过。

采集计数语义澄清记录：
- 根因：`已采集` 实际表示“已从列表 DOM 发现并加入导出队列”，用户容易理解成“正文和图片已完整抓取完成”。
- 修复：popup 主统计文案改为 `已发现`、`本轮发现`、`详情完成`，把列表发现进度和详情增强进度分开。
- 修复：`CollectionState` 新增 `detailEnhancedCount` 和 `detailEnhancementTotal`；详情增强入队时增加总数，单条增强完成或安全回退后增加完成数。
- 版本号已从 `0.1.8` 升到 `0.1.9`，`dist/manifest.json` 版本确认为 `0.1.9`。
- 验证通过：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

GitHub 开源 README 重写执行计划：
- [x] README P0-1：审阅现有 README、manifest 和导出代码。验证：README 描述和当前 `0.1.9` 功能一致。
- [x] README P0-2：核对 Obsidian Web Clipper 官方定位。验证：对比段落写成定位差异，不夸大或贬低官方工具。
- [x] README P0-3：重写中英文 README。验证：覆盖“是什么、为什么、解决什么、区别、安装、使用、导出结构、隐私权限、限制、FAQ、开源发布建议”。
- [x] README P0-4：跑文档检查。验证：`git diff --check` 通过。

GitHub 开源 README 重写记录：
- README 已改为 GitHub 首页型结构，中文为主、英文完整快速版，适合仓库展示和对外传播。
- 新增与社区同类工具、Obsidian Web Clipper 的定位差异说明，强调本项目是 X Bookmarks 批量导出到 Obsidian 的专用工具。
- 新增导出文件逐项解释、计数语义说明、隐私权限表、已知限制、FAQ 和开源发布前建议。
- 验证通过：`git diff --check` 通过。

项目整体改名为 MarkHarbor 执行计划：
- [x] Rename P0-1：同步项目元数据。验证：`package.json`、`package-lock.json`、`src/manifest.ts` 版本和包名一致。
- [x] Rename P0-2：同步扩展显示名。验证：中英文 locale 的 `extName` 均为 `MarkHarbor`，描述文案包含新品牌定位。
- [x] Rename P0-3：清理公开文档旧名。验证：README、交接文档、任务记录和历史计划文档不再残留旧展示名。
- [x] Rename P0-4：重新构建产物。验证：`dist/manifest.json` 版本和扩展名与源码一致。
- [x] Rename P0-5：跑完整验证并提交。验证：测试、类型检查、构建、审计和 diff 空白检查全部通过。

项目整体改名为 MarkHarbor 记录：
- 项目包名已从旧描述型名称改为 `markharbor`。
- 扩展显示名、popup 标题、浏览器 HTML 标题、README、交接文档、任务记录和历史计划/设计文档已同步为 `MarkHarbor`。
- 导出 HTML 和合并 Markdown 的标题已改为 `MarkHarbor Export`，保留 `X Bookmarks Index.md` 作为 Obsidian 导出索引文件名。
- 初始设计/计划文档已重命名为 `docs/superpowers/specs/2026-05-16-markharbor-design.md` 和 `docs/superpowers/plans/2026-05-16-markharbor.md`。
- 版本号已从 `0.1.9` 升到 `0.1.10`，`dist/manifest.json` 版本确认为 `0.1.10`。
- 验证通过：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过；旧展示名精确搜索无残留。

GitHub 开源发布材料准备执行计划：
- [x] OSS P0-1：补齐社区健康文件。验证：存在 `LICENSE`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、issue 模板和 PR 模板。
- [x] OSS P0-2：补齐 CI 和发布打包流程。验证：GitHub Actions 能跑测试/类型检查/构建，tag release 能生成扩展 zip。
- [x] OSS P0-3：补齐未上架 Chrome Web Store 的安装说明。验证：README 和 `docs/INSTALL.md` 明确 GitHub Releases 下载、解压、加载 unpacked extension、更新方式和源码构建方式。
- [x] OSS P0-4：补齐发布、隐私、路线图和变更记录文档。验证：存在 `docs/RELEASE.md`、`docs/PRIVACY.md`、`docs/ROADMAP.md`、`CHANGELOG.md`。
- [x] OSS P0-5：跑完整验证并提交。验证：`npm test`、`npm run typecheck`、`npm run build`、`npm run package`、`npm audit --audit-level=moderate`、`git diff --check` 全部通过。

GitHub 开源发布材料准备记录：
- 新增 MIT `LICENSE`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`SECURITY.md`、`SUPPORT.md` 和 `CHANGELOG.md`。
- 新增 GitHub issue 模板、PR 模板、Dependabot 配置、CI workflow 和 tag release workflow。
- 新增 `scripts/package-extension.mjs` 和 `npm run package`，可生成 `release/markharbor-v0.1.10.zip`。
- README 和 `docs/INSTALL.md` 已改为未上架 Chrome Web Store 的主流安装路径：从 GitHub Releases 下载 zip、解压、在 `chrome://extensions` 中加载解压后的 `markharbor/` 文件夹。
- 新增 `docs/RELEASE.md`、`docs/PRIVACY.md` 和 `docs/ROADMAP.md`，覆盖发布流程、隐私权限和项目边界。
- 验证通过：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm run package` 通过并确认 zip 内含 `markharbor/manifest.json`；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。

GitHub 发布后依赖维护执行计划：
- [x] Maint P0-1：合并 CI 通过的低风险 Dependabot PR。验证：GitHub Actions 三个 action 更新和 `@types/node` 更新已合并，main CI 通过。
- [x] Maint P0-2：处理冲突/失败的依赖 PR。验证：在 main 上手动吸收 `jsdom`、`typescript`、`@types/chrome` 升级，并修复 TypeScript 6 和新版 Chrome 类型问题。
- [x] Maint P0-3：同步版本号。验证：`package.json`、`package-lock.json`、`src/manifest.ts` 和 `dist/manifest.json` 均为 `0.1.11`。
- [x] Maint P0-4：跑完整验证。验证：`npm test`、`npm run typecheck`、`npm run build`、`npm run package`、`npm audit --audit-level=moderate`、`git diff --check` 全部通过。
- [ ] Maint P0-5：提交、推送并发布 `v0.1.11`。验证：GitHub CI 和 Release workflow 通过，Release asset 已生成。

GitHub 发布后依赖维护记录：
- 合并 Dependabot PR #1、#2、#3、#4，更新 `actions/checkout`、`actions/upload-artifact`、`actions/setup-node` 和 `@types/node`。
- PR #6 因 lockfile 冲突未能直接合并，已在 main 上手动升级 `jsdom` 到 `^29.1.1`。
- PR #5 的 TypeScript 6 CI 失败根因是 CSS side-effect import 缺少声明，已新增 `src/vite-env.d.ts`。
- PR #7 的新版 `@types/chrome` CI 失败根因是 Chrome Promise 返回类型更严格，已调整 `RenderedTextChromeApi` 和 popup 测试 mock。
- 版本号已从 `0.1.10` 升到 `0.1.11`。
- 本地验证通过：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm run package` 通过并确认 zip 内含 `markharbor/manifest.json`；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
