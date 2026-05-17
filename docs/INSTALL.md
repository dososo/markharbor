# Install MarkHarbor

MarkHarbor is not yet published on the Chrome Web Store. The recommended public installation path is a GitHub Release zip loaded as an unpacked Chrome extension.

## Recommended: Install from GitHub Releases

1. Open the repository's `Releases` page.
2. Download `markharbor-vX.Y.Z.zip` from the latest release assets.
3. Unzip the file.
4. Open Chrome and go to `chrome://extensions`.
5. Enable `Developer mode`.
6. Click `Load unpacked`.
7. Select the extracted `markharbor/` folder that contains `manifest.json`.
8. Open `https://x.com/i/bookmarks`.
9. Click the MarkHarbor extension icon.

Keep the extracted folder on disk. Chrome loads unpacked extensions from that folder path, so moving or deleting it can disable the extension.

## Update from a New Release

1. Download the newest `markharbor-vX.Y.Z.zip`.
2. Unzip it.
3. Replace the old extracted `markharbor/` folder or keep a versioned folder.
4. Open `chrome://extensions`.
5. Click `Reload` on MarkHarbor.

If you moved the folder, remove the old extension card and load the new extracted folder again.

## Build from Source

Use this path if you want to inspect or modify the code before loading the extension.

```bash
git clone <repository-url>
cd markharbor
npm ci
npm run build
```

Then load the generated `dist/` folder from `chrome://extensions`.

## Package a Local Zip

```bash
npm run package
```

This creates:

```text
release/markharbor-vX.Y.Z.zip
```

The zip contains a `markharbor/` folder ready to load as an unpacked extension.

## 中文安装说明

MarkHarbor 还没有上架 Chrome Web Store。公开发布时，普通用户建议从 GitHub Releases 下载 `markharbor-vX.Y.Z.zip`，解压后在 `chrome://extensions` 中开启开发者模式，并选择解压得到的 `markharbor/` 文件夹进行“加载已解压的扩展程序”。

注意：不要删除或移动这个解压目录，否则 Chrome 可能找不到插件文件。
