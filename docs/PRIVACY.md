# Privacy

MarkHarbor is designed as a local-first browser extension.

## What MarkHarbor Does

- Reads X Bookmarks that are loaded in your own browser tab after you start collection.
- Opens same-origin X detail pages when detail enhancement is enabled.
- Downloads accessible X image attachments when image download is enabled.
- Creates a local zip export.

## What MarkHarbor Does Not Do

- Does not upload bookmarks to any server.
- Does not require a cloud account.
- Does not read your X password.
- Does not read X cookies.
- Does not call undocumented X internal APIs.
- Does not collect in the background before you click start.
- Does not download X videos.
- Does not fetch arbitrary external article full text.

## Chrome Permissions

| Permission | Purpose |
| --- | --- |
| `activeTab` | Communicate with the active X Bookmarks page after user interaction. |
| `downloads` | Save the exported zip. |
| `scripting` | Inject the collector and read rendered detail pages. |
| `https://x.com/*` | Work on X Bookmarks and same-origin X detail pages. |
| `https://pbs.twimg.com/*` | Download accessible X image attachments. |

## Data Handling

Exports are created locally in your browser and saved through Chrome downloads. You control where the zip file is stored and whether to import it into Obsidian.

## 中文说明

MarkHarbor 本地运行，不上传书签，不读取 X 密码或 cookie，不调用未公开的 X 内部接口。插件只在用户点击开始采集后读取当前浏览器中已加载的 X Bookmarks，并把结果保存为本地 zip。
