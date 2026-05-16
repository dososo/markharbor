# X Bookmarks Obsidian Exporter Design

Date: 2026-05-16
Status: Draft for user review

## Goal

Build a Chrome extension that helps users export their own X Bookmarks into Obsidian-friendly files with minimal setup.

The first version optimizes for convenience, privacy, and a small implementation surface. It should feel close to one-click export, while staying honest about the limits of what a browser extension can reliably collect from X's infinite-scroll bookmark page.

## Non-Goals

- Do not build a cloud SaaS account system in v1.
- Do not upload bookmark data to any server.
- Do not read X cookies.
- Do not call undocumented X internal APIs.
- Do not run hidden background scraping.
- Do not promise complete full-history export.
- Do not download X video files in v1.
- Do not add AI summarization, tagging, search, sync, or team features in v1.

## User Flow

1. The user installs the Chrome extension.
2. The user opens `https://x.com/i/bookmarks` while logged in to X.
3. The user opens the extension popup and clicks `Start collecting`.
4. The extension assists in-page scrolling so more bookmarks load.
5. The extension parses loaded bookmark cards and deduplicates them by post URL or post ID when available.
6. The popup shows collection status:
   - total collected bookmarks
   - newly collected bookmarks from the last scan
   - whether collection is currently running
   - a stop control
7. The user stops collection or lets it stop after no new bookmarks are found for a defined number of scans.
8. The user chooses an export format:
   - one combined Markdown file
   - one Markdown file per bookmark
   - JSON raw export
9. The extension downloads a local export package.

## Collection Model

The extension collects only content visible in, or loaded into, the current X Bookmarks page. It may scroll the page in response to the user's explicit action, but it does not scrape in the background.

Collection should be resilient but conservative:

- Parse tweet/bookmark cards from the DOM.
- Prefer stable links and visible text over brittle class names.
- Deduplicate entries as they are collected.
- Keep partial results if collection is stopped.
- Show the user that export completeness depends on how much the page was able to load.

If X changes its DOM, the extension may need parser updates. This is an accepted maintenance cost for the Chrome-extension route.

## Bookmark Data

Each collected bookmark should store:

- source post URL
- post ID, when derivable from the URL
- author display name, when visible
- author handle, when visible
- post text
- visible timestamp or datetime value, when available
- collection timestamp
- image URLs found in the card
- video source post URL and visible preview/thumbnail metadata, when available
- raw text fallback for debugging parser misses

The extension should not store credentials, cookies, or unrelated browsing data.

## Obsidian Export

The extension supports both Obsidian output styles at export time.

### Combined Markdown

Generate one file, for example:

`X Bookmarks Export 2026-05-16.md`

Each bookmark appears as a section containing:

- author and handle
- original X link
- timestamp, if available
- post text
- embedded local images when downloaded
- video link and preview metadata when available

### One Note Per Bookmark

Generate one Markdown file per bookmark. File names should be deterministic and filesystem-safe, using available metadata:

`2026-05-16-author-short-title.md`

Each note should include YAML front matter:

```yaml
source: x-bookmarks
url: "https://x.com/..."
author: "Author"
handle: "@handle"
collected_at: "2026-05-16T00:00:00Z"
tags:
  - x-bookmarks
```

The note body should include the post text, source link, and media references.

### Attachments

Images may be downloaded into an attachment folder:

`attachments/x-bookmarks/`

Markdown files should reference local image paths when image downloads succeed. If an image download fails, the Markdown should keep the original image URL as a fallback.

Videos are not downloaded in v1. Video bookmarks should include the source post URL and any visible preview/thumbnail information.

### JSON Export

Always allow raw JSON export. This gives users a stable backup and allows future versions to regenerate Markdown without recollecting from X.

## Chrome Extension Surface

The v1 extension should include:

- a popup UI with collection controls
- a content script for parsing the X Bookmarks page
- an export module for Markdown, JSON, and attachment packaging
- minimal permissions limited to X and downloads

Suggested permissions:

- `activeTab`
- `downloads`
- host permission for `https://x.com/*`

Avoid broad host permissions.

## Error Handling

The extension should handle common failures with clear local messages:

- user is not on the X Bookmarks page
- no bookmarks detected
- X page has not loaded enough content yet
- image download failed
- export package generation failed

Failures should not discard already collected bookmarks unless the user explicitly clears them.

## Privacy Position

The product should be explicit:

- bookmark data stays local
- no cloud account is required
- no server receives exported data
- the extension does not read passwords, cookies, or unrelated browsing history

This privacy position should be reflected in the Chrome Web Store listing and any README.

## Testing Strategy

Use focused tests for the pieces most likely to break:

- DOM parser fixtures for representative X bookmark cards
- Markdown generation snapshots
- filename sanitization
- deduplication behavior
- JSON export shape

Manual browser verification should cover:

- not-on-bookmarks-page state
- collecting visible bookmarks
- guided scrolling collection
- stopping collection
- combined Markdown export
- one-note-per-bookmark export
- image attachment fallback behavior

## Open Implementation Decisions

These should be resolved during implementation planning:

- Whether exports are downloaded as a zip package or as individual files.
- Whether image downloading happens by default or behind a checkbox.
- The exact stop condition for guided scrolling.
- The project stack for extension build tooling.

## Success Criteria

The MVP is successful when:

- a user can open X Bookmarks, click one control, and collect loaded bookmarks with guided scrolling
- the user can export either one combined Markdown file or one Markdown file per bookmark
- the export works well when moved into an Obsidian vault
- images are preserved as local attachments when possible
- videos are represented by links and preview metadata, not downloaded files
- no bookmark data is uploaded to a server
