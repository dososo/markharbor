# 截图与展示素材

本项目已内置一套可公开发布的演示素材，使用脱敏示例数据生成，不包含真实 X 账号、真实书签或私人内容。

## 生成方式

```bash
npm run assets:showcase
```

脚本会同时生成 SVG 源文件和 PNG 成品，方便后续修改文案、重新导出或用于不同平台。

## 仓库展示图

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `docs/assets/markharbor-social-preview.png` | 1280 x 640 | GitHub 仓库 Social Preview |
| `docs/assets/store/promo-small-440x280.png` | 440 x 280 | Chrome Web Store 小推广图 |
| `docs/assets/store/promo-marquee-1400x560.png` | 1400 x 560 | Chrome Web Store 横幅推广图 |

## 操作演示视频

| 文件 | 位置 | 用途 |
| --- | --- | --- |
| `markharbor-demo-2026-05-17.mp4` | GitHub Release `v0.1.11` | README 和 Release 页面展示完整操作流程 |

## 插件完整截图

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `docs/assets/screenshots/popup-ready.png` | 1280 x 800 | 打开 X 书签页后、未开始采集 |
| `docs/assets/screenshots/popup-collecting.png` | 1280 x 800 | 采集中，展示进度和当前处理内容 |
| `docs/assets/screenshots/popup-export-ready.png` | 1280 x 800 | 采集完成，准备导出 zip |

## 内容与导出截图

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `docs/assets/screenshots/export-zip-structure.png` | 1280 x 800 | 导出包结构，展示 Markdown、附件、JSON、CSV、HTML |
| `docs/assets/screenshots/obsidian-index.png` | 1280 x 800 | Obsidian 中的 `X Bookmarks Index.md` |
| `docs/assets/screenshots/obsidian-note.png` | 1280 x 800 | 单条 Markdown 笔记，展示正文、来源和链接卡片 |
| `docs/assets/screenshots/html-preview.png` | 1280 x 800 | `bookmarks.html` 离线浏览效果 |

## 商店截图

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `docs/assets/screenshots/store-screenshot-1-overview.png` | 1280 x 800 | 功能概览 |
| `docs/assets/screenshots/store-screenshot-2-collection.png` | 1280 x 800 | 采集过程 |
| `docs/assets/screenshots/store-screenshot-3-obsidian.png` | 1280 x 800 | Obsidian 导出结果 |

## 使用规则

- 发布前不要使用包含真实账号、真实书签、私信、付费内容或敏感信息的截图。
- GitHub README 优先使用 `docs/assets/screenshots/` 下的 PNG。
- Chrome Web Store 优先使用 `docs/assets/store/` 和 `docs/assets/screenshots/store-screenshot-*.png`。
- 如果需要更新截图文案，修改 `scripts/generate-showcase-assets.mjs` 后重新运行 `npm run assets:showcase`。
- 生成后抽样检查中文是否正常、画面是否被裁切、文字是否能在 GitHub 缩略图尺寸下读清。
