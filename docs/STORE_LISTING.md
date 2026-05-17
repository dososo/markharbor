# Chrome Web Store Listing Draft

MarkHarbor is not yet published on the Chrome Web Store. This document prepares the listing copy and permission explanations for a future submission.

## Product Name

MarkHarbor

## Short Description

Export loaded X Bookmarks into an Obsidian-ready local archive with Markdown, JSON, CSV, HTML, and image attachments.

## Detailed Description

MarkHarbor is a local-first Chrome extension for people who use X Bookmarks as a reading queue, research inbox, or writing source, but want long-term control in Obsidian.

Open `https://x.com/i/bookmarks`, start collection, and export a local zip package. MarkHarbor creates a clickable Obsidian index, one Markdown note per bookmark, structured JSON, CSV, TXT, browsable HTML, image attachments, a media manifest, and an export report.

Highlights:

- Local-first: no cloud account and no data upload.
- Obsidian-ready: index, per-bookmark notes, YAML properties, source links, and attachment folders.
- X Bookmarks focused: handles loaded bookmark cards, guided scrolling, link cards, X Articles, images, and safe fallbacks.
- Detail enhancement: attempts to capture fuller post text and X Article body content from same-origin X detail pages.
- Transparent exports: JSON, CSV, HTML, media manifest, and export report make the archive auditable.

Important limitations:

- MarkHarbor cannot guarantee exporting your entire historical X Bookmarks archive.
- Completeness depends on what X loads and renders in your browser.
- X Article capture is best-effort and may fall back to visible bookmark card content.
- External article full text is not fetched.
- X videos are not downloaded.

## Permission Justifications

| Permission | Justification |
| --- | --- |
| `activeTab` | Communicate with the active X Bookmarks page after the user opens the extension. |
| `downloads` | Save the local export zip. |
| `scripting` | Inject the collection script and read rendered same-origin detail pages after user action. |
| `https://x.com/*` | Work on X Bookmarks and same-origin X post/detail pages. |
| `https://pbs.twimg.com/*` | Download accessible X image attachments into the local export. |

## Privacy Practices

MarkHarbor:

- Does not upload bookmark data.
- Does not require an account.
- Does not read X passwords.
- Does not read X cookies.
- Does not call undocumented X internal APIs.
- Does not collect in the background before the user starts collection.
- Does not download X videos.

## Store Assets Needed

- 128 x 128 extension icon.
- 440 x 280 small promotional tile.
- 920 x 680 screenshots.
- 1280 x 800 screenshots.
- Optional 1400 x 560 marquee promotional image.

Suggested screenshots:

1. Popup on X Bookmarks before collection.
2. Popup while collection is running.
3. Export zip structure.
4. Obsidian view of `X Bookmarks Index.md`.
5. Single Markdown note with original text and images.

## 中文上架说明

Chrome Web Store 文案必须诚实描述边界：不能承诺导出全部历史书签，不能暗示绕过 X 限制，不能说会下载视频，也不能说会抓外部文章全文。权限说明应强调本地导出、用户触发、同源 X 页面和图片附件下载。
