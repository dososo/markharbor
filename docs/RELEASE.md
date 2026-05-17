# Release Guide

This guide is for maintainers publishing MarkHarbor to GitHub.

## Release Checklist

1. Confirm the working tree is clean.
2. Update `package.json`, `package-lock.json`, and `src/manifest.ts` to the same version.
3. Update `CHANGELOG.md`.
4. Run:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run package
npm audit --audit-level=moderate
git diff --check
```

5. Inspect `release/markharbor-vX.Y.Z.zip`.
6. Load the packaged extension manually in Chrome:
   - unzip the release asset
   - open `chrome://extensions`
   - load the extracted `markharbor/` folder
   - test collection and zip export on `https://x.com/i/bookmarks`
7. Commit changes.
8. Tag the release:

```bash
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

The `Release` GitHub Action builds the extension and attaches `markharbor-vX.Y.Z.zip` to a GitHub Release.

## First GitHub Repository Setup

After creating the repository on GitHub:

1. Add repository description:
   `Local-first X Bookmarks to Obsidian exporter.`
2. Add topics:
   `chrome-extension`, `obsidian`, `x`, `twitter`, `bookmarks`, `markdown`, `local-first`, `typescript`
3. Enable GitHub Actions.
4. Create the first release tag after CI passes.
5. Attach or verify the generated release asset.

## 中文发布说明

首次开源时，建议先推送代码到 GitHub，确认 CI 通过，再创建 `v0.1.10` 这类 tag。Release workflow 会生成可供普通用户下载的 `markharbor-v0.1.10.zip`。发布前必须手动加载 release zip 验证一次真实 Chrome 使用流程。
