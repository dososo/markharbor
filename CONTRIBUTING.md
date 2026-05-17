# Contributing to MarkHarbor

感谢你考虑贡献 MarkHarbor。This project welcomes focused bug reports, documentation fixes, parser improvements, and export-format improvements.

## Project Scope

MarkHarbor is intentionally narrow:

- Collect loaded X Bookmarks from the user's own browser session.
- Export an Obsidian-friendly local archive.
- Preserve visible post text, X Article text, images, link cards, and traceable metadata as well as the browser can access them.

Current non-goals:

- Cloud sync.
- Reading X passwords or cookies.
- Calling undocumented X internal APIs.
- Downloading X videos.
- Fetching arbitrary external article full text.

## Development Setup

```bash
npm ci
npm test
npm run typecheck
npm run build
```

To package a local release zip:

```bash
npm run package
```

The zip is written to `release/` and is ignored by git.

## Manual Extension Testing

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable Developer Mode.
4. Click `Load unpacked`.
5. Select `dist/`.
6. Open `https://x.com/i/bookmarks`.
7. Start collection, stop collection, and export a zip.
8. Verify `X Bookmarks Index.md`, `bookmarks/*.md`, `bookmarks.json`, `bookmarks.csv`, `bookmarks.html`, `media-manifest.json`, and image attachments.

## Pull Request Checklist

- Keep changes scoped to the issue or feature.
- Add or update tests when behavior changes.
- Run `npm test`, `npm run typecheck`, `npm run build`, and `npm run package`.
- Do not include private bookmark exports, screenshots with private content, or generated release zip files.
- Update README or docs when user-facing behavior changes.

## Reporting Bugs

Use the bug report template and include:

- MarkHarbor version.
- Browser and OS.
- Reproduction steps.
- Expected and actual behavior.
- Counts from `export-report.json` if relevant.

请不要上传包含私人书签内容的导出包。
