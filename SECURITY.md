# Security Policy

## Supported Versions

Only the latest released version is supported for security and privacy fixes.

## Reporting a Vulnerability

Please do not open a public GitHub issue for security or privacy vulnerabilities.

Until a dedicated security contact is published, report issues privately to the repository owner through GitHub. Include:

- MarkHarbor version.
- Browser and OS.
- Exact reproduction steps.
- What data or permission boundary may be affected.
- Screenshots or logs with private bookmark content removed.

## Security Model

MarkHarbor is designed to be local-first:

- No cloud account.
- No data upload.
- No X password access.
- No X cookie access.
- No undocumented X internal API calls.
- No background collection before the user starts collection.
- No X video downloads.

The extension uses Chrome permissions for the active X Bookmarks tab, same-origin X detail pages, downloading the exported zip, injecting collection scripts, and downloading X image attachments from `pbs.twimg.com`.

## 中文说明

如果发现安全或隐私问题，请不要提交公开 issue。请通过 GitHub 私下联系仓库所有者，并移除截图、日志和导出包中的私人书签内容。
