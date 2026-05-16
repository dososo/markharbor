# X 书签 Obsidian 导出器

一个本地优先的 Chrome 插件，用于把已加载的 X Bookmarks 导出为 Obsidian 友好的 Markdown、JSON 和图片附件。

## 隐私说明

- 数据保留在本地。
- 不需要云端账号。
- 不上传书签数据。
- 不读取 X cookie。
- 不调用未公开的 X 内部接口。
- v1 不下载视频文件，只保存原帖链接和可见预览信息。

## 本地开发

```bash
npm install
npm run build
```

然后在 Chrome 打开 `chrome://extensions`，启用开发者模式，选择 `dist/` 作为未打包扩展加载。

## 使用方式

1. 登录 X。
2. 打开 `https://x.com/i/bookmarks`。
3. 点击插件按钮。
4. 点击“开始采集”。
5. 等待插件引导页面滚动并采集已加载书签。
6. 点击“导出 zip”。
7. 将 zip 解压到 Obsidian vault 中。

## 导出内容

导出的 zip 包含：

- `bookmarks.json`：原始结构化数据。
- `X Bookmarks Export.md`：合集 Markdown。
- `bookmarks/`：每条书签一个 Markdown 文件。
- `attachments/x-bookmarks/`：成功下载的图片附件。

## 验证清单

- 不在 X Bookmarks 页面时显示提示。
- 在 X Bookmarks 页面能采集可见书签。
- 引导滚动后采集数量增加。
- 停止采集后保留已采集结果。
- 导出的 zip 包包含 `bookmarks.json`。
- 导出的 zip 包包含 `X Bookmarks Export.md`。
- 导出的 zip 包包含 `bookmarks/` 下的单条书签 Markdown 文件。
- 图片下载失败时 Markdown 保留原始图片 URL。
