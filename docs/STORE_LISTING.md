# Chrome Web Store 上架材料草稿

MarkHarbor 目前尚未上架 Chrome Web Store。本文档用于准备未来上架时的文案、权限说明和素材清单。

## 产品名称

MarkHarbor

## 一句话简介

把已加载的 X 书签导出为 Obsidian 就绪的本地资料库包，包含 Markdown、JSON、CSV、HTML 和图片附件。

## 详细描述

MarkHarbor 是一个本地优先的 Chrome 扩展，适合把 X Bookmarks 当作阅读队列、研究收件箱或写作素材库的人。

打开 `https://x.com/i/bookmarks`，点击开始采集，然后导出本地 zip 包。MarkHarbor 会生成可点击的 Obsidian 索引、每条书签一份 Markdown 笔记、结构化 JSON、CSV、TXT、可浏览 HTML、图片附件、媒体清单和导出报告。

核心亮点：

- 本地优先：不需要云账号，不上传书签数据。
- Obsidian 友好：生成索引、单条笔记、YAML 属性、来源链接和附件目录。
- 专注 X Bookmarks：围绕已加载书签卡片、辅助滚动、链接卡片、X Article、图片附件和失败回退做定制。
- 正文增强：尽量从同源 X 详情页补齐更完整的推文正文和 X Article 内容。
- 导出透明：JSON、CSV、HTML、媒体清单和导出报告方便审计和二次处理。

重要边界：

- 不能保证导出全部历史 X 书签。
- 完整度取决于 X 在浏览器中实际加载和渲染的内容。
- X Article 采集是尽力而为，失败时会回退到列表页可见内容。
- 不抓取外部文章全文。
- 不下载 X 视频。

## 权限说明

| 权限 | 用途 |
| --- | --- |
| `activeTab` | 用户打开扩展后，与当前 X 书签页通信 |
| `downloads` | 保存本地导出 zip |
| `scripting` | 注入采集脚本，并在用户触发后读取同源 X 详情页渲染内容 |
| `https://x.com/*` | 在 X 书签页和同源 X 原帖详情页工作 |
| `https://pbs.twimg.com/*` | 下载可访问的 X 图片附件到本地导出包 |

## 隐私说明

MarkHarbor：

- 不上传书签数据。
- 不需要注册账号。
- 不读取 X 密码。
- 不读取 X cookie。
- 不调用未公开的 X 内部接口。
- 不在用户点击开始采集前后台静默收集。
- 不下载 X 视频。

## 已生成素材

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| `docs/assets/store/promo-small-440x280.png` | 440 x 280 | 小推广图 |
| `docs/assets/store/promo-marquee-1400x560.png` | 1400 x 560 | 横幅推广图 |
| `docs/assets/screenshots/store-screenshot-1-overview.png` | 1280 x 800 | 商店截图：功能概览 |
| `docs/assets/screenshots/store-screenshot-2-collection.png` | 1280 x 800 | 商店截图：采集过程 |
| `docs/assets/screenshots/store-screenshot-3-obsidian.png` | 1280 x 800 | 商店截图：Obsidian 结果 |

## 仍需人工处理

- 128 x 128 扩展图标已由扩展本身提供，提交商店前需要按 Chrome Web Store 后台要求上传。
- Chrome Web Store 的最终隐私问卷需要按发布当日后台字段逐项填写。
- 上架前需要用真实 Chrome 环境做一次完整人工验收：安装、采集、停止、导出、解压、打开 Obsidian 索引。

## 上架文案注意事项

- 不承诺导出全部历史书签。
- 不暗示绕过 X 的限制或付费墙。
- 不宣传抓取外部文章全文。
- 不宣传下载视频。
- 权限解释要强调本地导出、用户触发、同源 X 页面和图片附件下载。
