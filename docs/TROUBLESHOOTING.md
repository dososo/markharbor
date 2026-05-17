# Troubleshooting

## Quick Checks

- Use the latest GitHub Release zip.
- Unzip the file before loading it in Chrome.
- Load the extracted `markharbor/` folder, not the zip file itself.
- Confirm the loaded folder contains `manifest.json`.
- Keep `https://x.com/i/bookmarks` open while collecting.
- Keep the extracted extension folder on disk after loading it.

## MarkHarbor Icon Does Not Work

1. Open `chrome://extensions`.
2. Confirm MarkHarbor is enabled.
3. Click `Reload`.
4. Open `https://x.com/i/bookmarks`.
5. Click the extension icon again.

If the page was already open before installing or updating MarkHarbor, reloading the extension normally fixes stale content scripts.

## Chrome Says the Extension Is Invalid

Most common causes:

- You selected the wrong folder.
- You selected the zip file instead of the extracted folder.
- The folder does not contain `manifest.json`.
- The download was incomplete.

Download the release zip again, unzip it, and select the inner `markharbor/` folder.

## Collection Starts but Counts Look Low

`Discovered` means MarkHarbor found bookmarks currently mounted in the X Bookmarks page DOM. X uses virtualized scrolling, so old items can disappear from the DOM while new items appear.

Let the page keep scrolling. Use `Details done` to track detail enhancement progress.

## X Article Text or Images Are Missing

X Article capture is best-effort. It depends on what X renders in same-origin detail pages. If X does not mount a paragraph or image in the DOM, MarkHarbor safely falls back to the visible bookmark card content.

Things to try:

- Keep advanced full article mode enabled.
- Keep the X Bookmarks page open and active.
- Try a smaller collection run first.
- Export again after X has loaded more of the list.

## Images Are Remote Links Instead of Local Files

Image downloads can fail because of network errors, remote restrictions, or permission issues. Check `media-manifest.json` in the export zip for per-image status.

## Videos Are Not Downloaded

This is expected. MarkHarbor saves source post links and visible preview information. It does not download X videos.

## 中文排障说明

- 插件未上架 Chrome Web Store，目前请从 GitHub Releases 下载 zip，解压后加载 `markharbor/` 文件夹。
- 如果 Chrome 提示插件无效，通常是选错目录或直接选择了 zip。
- 如果计数偏低，通常是 X Bookmarks 页面还没有滚动加载更多内容。
- 如果 X Article 正文或图片不完整，说明 X 详情页没有完整渲染对应 DOM，插件会安全回退，不伪造内容。
