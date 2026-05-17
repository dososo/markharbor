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
- 项目整体命名已改为 MarkHarbor：
  - npm 包名：`markharbor`
  - Chrome 扩展显示名：`MarkHarbor`
  - popup 标题：`MarkHarbor`
  - 导出 HTML / 合并 Markdown 标题：`MarkHarbor Export`
  - 当前版本：`0.1.10`
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
- `docs/superpowers/specs/2026-05-16-markharbor-design.md`
- `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md`
- `docs/superpowers/plans/2026-05-16-markharbor.md`
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
- X Article 正文配图与采集体感回归验证
  - 结果：通过真实 Chrome DOM 只读检查，确认 X Article 完整正文位于 `twitterArticleReadView` / `twitterArticleRichTextView` / `longformRichTextComponent`，正文配图节点为 `tweetPhoto`，不能只依赖普通 `tweetText` 或封面卡片路径。
  - 结果：后台详情页增强现在会优先解析 rich text 正文区域，并等待 rich text 完整结果，避免只返回封面图。
  - 结果：采集循环已改为扫描后立即滚动，详情页正文增强后台执行；自动采集收尾前等待增强结果。
  - 结果：版本号已升到 `0.1.2`，`dist/manifest.json` 生成版本为 `0.1.2`。
  - 结果：完整验证通过，`npm test` 12 个测试文件、81 个测试通过；`npm run typecheck`、`npm run build`、`npm audit --audit-level=moderate`、`git diff --check` 均通过。
- X Article 正文图片懒加载回归修复
  - 背景：用户继续反馈 X Article 的 Markdown 和 HTML 正文仍只有封面图，没有正文配图。
  - 根因补充：上一轮把 `twitterArticleRichTextView` 出现当作完整加载，但真实 X Article 的正文图片会随着详情页滚动懒加载；文字先出现时，正文图片节点可能还没进入 DOM。
  - 修复：详情页未滚到底时，rich text 结果返回 `isComplete: false` 并主动滚动非激活详情页，后台轮询继续等待后续 DOM 更新。
  - 修复：图片提取扩展到 `tweetPhoto` 后代元素的 `background-image`，覆盖正文图不是直接 `<img>` 的真实 DOM 形态。
  - 版本：同步升到 `0.1.3`，`dist/manifest.json` 版本确认为 `0.1.3`。
  - 验证：`npm test` 12 个测试文件、83 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- X Article 激活详情页采集修复
  - 背景：用户继续反馈最新版导出仍看不到正文配图。
  - 证据：最新导出包 `bookmarks.json` 中，多篇 `textSource: "post-detail"` 的 X Article 有大量正文块，但 image block 为 0；问题仍在采集层，不在 Markdown/HTML 渲染层。
  - 证据：真实 Chrome 可见标签页打开 `crypto_dazui`、`_jiaran` 等 X Article 时，`twitterArticleRichTextView` 内能看到 20 多张 `pbs.twimg.com/media` 正文图。
  - 根因补充：后台用 `active: false` 打开的非激活详情页可能只完整渲染文字，不完整渲染 Article 内联图片。
  - 修复：X Article 详情增强改为短暂激活详情页读取，读取完成后恢复原书签页；普通推文仍保持非激活读取。
  - 修复：详情增强队列改为串行处理，避免多个激活详情页同时抢焦点。
  - 版本：同步升到 `0.1.4`，`dist/manifest.json` 版本确认为 `0.1.4`。
  - 验证：`npm test` 12 个测试文件、85 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- 完整正文配图高级模式稳定化
  - 背景：`0.1.4` 激活文章标签页会关闭 Chrome popup，导致用户无法观察进度、无法稳定停止、停止后仍继续开文章、无法导出。
  - 修复：撤掉激活标签页方案。高级模式改用非聚焦采集窗口 `chrome.windows.create({ focused: false })`，读取完成后关闭采集窗口，不切走书签页活动标签。
  - 修复：采集循环改为“扫描当前可见书签 -> 串行增强当前批次 -> 再滚动下一批”，符合一篇完成再下一篇的发布版体验。
  - 修复：`STOP_COLLECTION` 清空待增强队列并标记 `stopped`，不会继续打开后续文章；当前已开始的一篇自然收口。
  - 修复：popup 增加“完整正文配图高级模式”开关，并显示当前阶段和当前采集标题。
  - 版本：同步升到 `0.1.5`，`dist/manifest.json` 版本确认为 `0.1.5`。
  - 验证：`npm test` 12 个测试文件、86 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- 书签列表滚动与采集节奏匹配
  - 背景：用户反馈当前书签列表长时间不滚动，虽然 popup 显示采集中，但体感像没有推进。
  - 根因：`0.1.5` 会把当前可见批次的待增强书签全部处理完再滚动；高级正文配图耗时较长时，主列表会静止很久。
  - 修复：增强队列保留已发现书签，但每个采集循环只处理一条；一条增强完成后立即滚动列表，再继续下一条。
  - 版本：同步升到 `0.1.6`，`dist/manifest.json` 版本确认为 `0.1.6`。
  - 验证：`npm test` 12 个测试文件、87 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- X Article 正文快照累积与目标锁定
  - 背景：用户反馈很多 X Article 仍缺正文和正文图，且要求按原文顺序展示。
  - 证据：最新导出包中存在 `post-detail success` 但正文只有十几字或采到不相关英文内容的条目，说明问题在采集入库层，不是单条 Markdown/HTML 渲染阶段单独丢图。
  - 根因：X Article 详情页滚动时会虚拟化正文 DOM，旧实现每次轮询只保留最后一次快照，导致已滚过的段落和图片被覆盖；同时目标帖匹配过宽，可能把回复/推荐中包含目标链接的内容当成正文。
  - 修复：后台详情页增强按快照锚点累积 `contentBlocks`，用相邻已知块恢复段落和图片顺序；详情页注入时传入 Article 标题，匹配目标时优先看时间 permalink 和标题，并取消整页 read view 兜底抓取。
  - 修复：列表页已知封面图不会再混入 X Article 正文块，避免封面在 `## 原文` 里重复冒充正文配图。
  - 版本：同步升到 `0.1.7`，`dist/manifest.json` 版本确认为 `0.1.7`。
  - 验证：`npm test` 12 个测试文件、89 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- 采集启动可感知性优化
  - 背景：用户反馈点击“开始采集”后等待时间较长，书签列表不动、popup 状态不够明显，容易误判插件没有工作。
  - 修复：开始采集后先扫描当前可见书签并入队，然后立即滚动一次作为启动反馈；不会跳过当前可见书签，后续仍保持增强和滚动同步推进。
  - 修复：popup 采集中进度卡增加高亮、脉冲点和“采集中，请保持 X Bookmarks 页面打开。”提示，继续展示当前采集标题。
  - 版本：同步升到 `0.1.8`，`dist/manifest.json` 版本确认为 `0.1.8`。
  - 验证：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- 采集计数语义澄清
  - 背景：用户确认点击开始后 `已采集/本轮新增` 立即显示 4 会误解为 4 条已完成全文和图片采集。
  - 修复：主统计文案改为 `已发现`、`本轮发现`、`详情完成`，把列表 DOM 发现数量和详情增强完成数量分开。
  - 修复：`CollectionState` 新增 `detailEnhancedCount` 和 `detailEnhancementTotal`，详情增强入队时增加总数，单条增强完成或安全回退后增加完成数。
  - 版本：同步升到 `0.1.9`，`dist/manifest.json` 版本确认为 `0.1.9`。
  - 验证：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过。
- GitHub 开源 README 重写
  - 背景：用户准备将项目打包为标准 GitHub 开源仓库，并要求先写一份适合对外传播和仓库展示的中英文 README。
  - 修复：README 改为 GitHub 首页型结构，覆盖产品定位、痛点、功能、与同类工具和 Obsidian Web Clipper 的区别、安装、使用、导出结构、隐私权限、限制、FAQ 和开源发布前建议。
  - 说明：README 中对 Obsidian Web Clipper 的描述参考其官方页面，采用“定位差异”表述，避免误导为替代关系。
  - 验证：`git diff --check` 通过。
- 项目整体改名为 MarkHarbor
  - 背景：用户确认采用 MarkHarbor 作为公开项目名，并要求全项目同步。
  - 修复：同步 `package.json`、`package-lock.json`、`src/manifest.ts`、中英文 locale、popup 标题、HTML 标题、导出标题、README、交接文档、任务记录和历史计划/设计文档。
  - 修复：初始设计/计划文档重命名为 `docs/superpowers/specs/2026-05-16-markharbor-design.md` 和 `docs/superpowers/plans/2026-05-16-markharbor.md`。
  - 版本：同步升到 `0.1.10`，`dist/manifest.json` 版本确认为 `0.1.10`。
  - 验证：`npm test` 12 个测试文件、90 个测试通过；`npm run typecheck` 通过；`npm run build` 通过；`npm audit --audit-level=moderate` 通过，0 个漏洞；`git diff --check` 通过；旧展示名精确搜索无残留。

## 风险点

- X 页面 DOM 不稳定，后续可能导致解析器失效。
- X 原帖详情页正文增强依赖 X 页面 HTML 内嵌状态、DOM 和详情页渲染。普通推文、X Article 卡片、X Article rich text view 是不同 DOM 路径，若 X 修改结构或不返回对应数据，可能回退到列表页正文或 X Article 标题/摘要。
- X Article 正文图片高级模式依赖非聚焦采集窗口渲染详情页。该窗口不应抢走书签页活动标签，但仍依赖 X 页面 DOM，若 X 调整渲染策略或不把远处正文挂载进 DOM，仍可能回退到列表页正文或局部正文。
- X Article 排版依赖 DOM 字体大小、粗细、列表符号和图片节点推断，只保证尽量保留阅读结构，不保证完全复刻 X 原站视觉。
- 外部文章全文抓取会引入更宽权限、跨站限制、反爬、付费墙和审核风险。
- Chrome Web Store 发布文案必须避免暗示“绕过 X 限制”“自动导出全部历史书签”“下载视频”。

## 下一步建议

1. 重新加载 `dist/` 中的插件，进行真实 Chrome 手动验收，并在 `tasks/todo.md` 中记录结果。
2. 外部文章全文抓取仍需单独设计后再决定，当前版本只增强 X 原帖正文。
