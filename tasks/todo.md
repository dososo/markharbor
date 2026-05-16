# X Bookmarks Exporter Todo

## Current Goal

Build a simple, convenient Chrome extension for exporting X Bookmarks into an Obsidian-friendly knowledge base format.

## Assumptions

- Target users want speed and ease of use more than perfect full-history archival in the first version.
- The first version works from the user's own logged-in X Bookmarks page.
- The extension does not upload bookmark data to a server.
- Video content is exported as source post links plus available preview metadata, not downloaded as video files in v1.
- Obsidian integration means generating Markdown files and asset folders that can be placed in an Obsidian vault.

## Tasks

- [x] Clarify target platform: X / Twitter Bookmarks.
- [x] Clarify product shape: public user-facing tool, likely Chrome extension.
- [x] Clarify media boundary: images can be exported/downloaded; videos can be linked/previewed in v1.
- [x] Confirm export scope: guided in-page collection that assists loading more bookmarks, without background scraping or hidden API access.
- [x] Confirm Obsidian format: support both one note per bookmark and one combined export file, selectable at export time.
- [x] Propose 2-3 implementation approaches with trade-offs.
- [x] Present MVP design for approval.
- [x] Write approved design spec under `docs/superpowers/specs/`.
- [x] Task 1: Create project config files. Verification: config files exist and match the approved scaffold.
- [x] Task 1: Create Vite build config. Verification: build emits popup and content entries.
- [x] Task 1: Create extension manifest and placeholder entries. Verification: manifest references `index.html` and `assets/content.js`.
- [x] Task 1: Install dependencies. Verification: `npm install` completes and writes `package-lock.json`.
- [x] Task 1: Typecheck and build. Verification: `npm run typecheck` and `npm run build` pass.
- [x] Task 1: Commit scaffold. Verification: commit message is `chore: scaffold chrome extension project`.
- [x] Task 2: Write dedupe tests. Verification: `npm test -- src/shared/dedupe.test.ts` fails before implementation.
- [x] Task 2: Create shared bookmark types. Verification: `src/shared/types.ts` exports planned interfaces.
- [x] Task 2: Implement merge dedupe. Verification: dedupe test passes.
- [x] Task 2: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 2: Commit shared types and dedupe. Verification: commit message is `feat: add bookmark types and dedupe`.
- [x] Task 3: Add X bookmark card fixture. Verification: parser test can load representative X card HTML.
- [x] Task 3: Write DOM bookmark parser test. Verification: `npm test -- src/content/parseBookmarks.test.ts` fails before implementation.
- [x] Task 3: Implement DOM bookmark parser. Verification: parser test passes.
- [x] Task 3: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 3: Commit parser. Verification: commit message is `feat: parse loaded x bookmark cards`.
- [x] Task 4: Write filename and Markdown rendering tests. Verification: target tests fail before implementation.
- [x] Task 4: Implement filename helpers and Markdown renderers. Verification: target tests pass.
- [x] Task 4: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 4: Commit rendering helpers. Verification: commit message is `feat: render obsidian markdown exports`.
- [x] Task 5: Write failing zip export tests. Verification: `npm test -- src/shared/exportZip.test.ts` fails before implementation.
- [x] Task 5: Implement zip export builder. Verification: zip includes JSON, combined Markdown, per-bookmark Markdown, and optional image attachments.
- [x] Task 5: Run zip tests. Verification: `npm test -- src/shared/exportZip.test.ts` passes.
- [x] Task 5: Typecheck. Verification: `npm run typecheck` passes.
- [x] Task 5: Commit zip export. Verification: commit message is `feat: build local export zip`.
- [x] Task 6: Add popup/content message contracts. Verification: `src/shared/messages.ts` exports required types.
- [x] Task 6: Implement content script collection loop. Verification: content script handles status, start, stop, clear, off-page, and unknown messages.
- [x] Task 6: Typecheck and test. Verification: `npm run typecheck` and `npm test` pass.
- [x] Task 6: Commit content collection loop. Verification: commit message is `feat: collect bookmarks from content script`.
- [x] Task 7: Implement popup collection and export controls. Verification: popup can send start, stop, clear, status, and export actions.
- [x] Task 7: Add image download host permission. Verification: manifest includes `https://pbs.twimg.com/*` for X media attachments.
- [x] Task 7: Typecheck, test, and build. Verification: `npm run typecheck`, `npm test`, and `npm run build` pass.
- [x] Task 8: Add README usage and privacy documentation. Verification: README explains local development, usage, privacy, export contents, and manual validation.
- [x] V2 planning: Write productization design spec. Verification: `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md` covers export formats, Obsidian structure, attachments, competitor insights, visual direction, i18n, README, and success criteria.
- [x] V2 planning: Write implementation plan. Verification: `docs/superpowers/plans/2026-05-16-x-bookmarks-v2-productization.md` breaks work into testable tasks with file paths and verification steps.
- [ ] V2 Task 1: Enrich bookmark data model and parser. Verification: parser tests cover visible link card metadata and typecheck passes.
- [ ] V2 Task 2: Add export format renderers. Verification: CSV, TXT, HTML, media manifest, and export report tests pass.
- [ ] V2 Task 3: Upgrade Markdown and attachment structure. Verification: Markdown tests prove useful Obsidian notes, index links, and per-bookmark attachment paths.
- [ ] V2 Task 4: Package V2 zip with traceable media. Verification: zip tests prove V2 file structure, media manifest, export report, and local media references.
- [ ] V2 Task 5: Add bilingual popup and expressive UI. Verification: i18n tests, typecheck, and build pass; locale files are copied to `dist/`.
- [ ] V2 Task 6: Complete README and user documentation. Verification: README covers install, usage, formats, Obsidian workflow, privacy, limits, testing, publishing, FAQ, and English Quick Start.
- [ ] V2 Task 7: Full verification, live browser test, and audit. Verification: automated checks, security audit result, and Chrome live validation are recorded.

## Review

Chinese design spec written at `docs/superpowers/specs/2026-05-16-x-bookmarks-obsidian-exporter-design.md`.
Self-review found no placeholders or obvious contradictions. No implementation has started.

Implementation plan created at `docs/superpowers/plans/2026-05-16-x-bookmarks-obsidian-exporter.md`.
Next step is user approval of execution mode before code implementation.

Task 1 scaffold completed:
- Created TypeScript, Vite, Vitest, popup, manifest, and content script scaffold.
- `npm install` completed and created `package-lock.json`.
- `npm run typecheck` passed.
- `npm run build` passed and generated `dist/manifest.json`.
- `npm install` reported 5 moderate audit findings in transitive dependencies; no dependency versions were changed outside the approved scaffold.

Task 2 shared types and dedupe completed:
- Added `XBookmarkVideo`, `XBookmark`, and `CollectionState` shared interfaces.
- Added `mergeBookmarks` with id-first and normalized-url fallback deduplication.
- Confirmed `npm test -- src/shared/dedupe.test.ts` fails before implementation and passes after implementation.
- `npm run typecheck` passed.

Task 3 DOM bookmark parser completed:
- Added representative X bookmark card fixture and parser test.
- Confirmed `npm test -- src/content/parseBookmarks.test.ts` failed before implementation because `parseBookmarks` did not exist.
- Implemented DOM parsing for loaded tweet articles, canonical X status URLs, author fields, tweet text, posted time, media image URLs, video preview metadata, and raw article text.
- `npm test -- src/content/parseBookmarks.test.ts` passed.
- `npm run typecheck` passed.

Task 4 Markdown and filename rendering completed:
- Added tests for safe filenames, bookmark filenames, image filenames, combined Markdown, per-bookmark front matter, YAML escaping, and image URL fallback.
- Confirmed `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts` failed before implementation because the modules did not exist.
- Implemented filename helpers and Markdown renderers for Obsidian-oriented exports.
- `npm test -- src/shared/filenames.test.ts src/shared/markdown.test.ts` passed.
- `npm run typecheck` passed.

Task 5 zip export completed:
- Added `buildExportZip` for JSZip packages containing `bookmarks.json`, combined Markdown, per-bookmark Markdown files, and optional image attachments.
- Confirmed `npm test -- src/shared/exportZip.test.ts` failed before implementation because `src/shared/exportZip.ts` did not exist.
- Added coverage for includeImages false, unique image fetching, successful local attachment paths, undefined image fetch results, and rejected image fetch fallback.
- `npm test -- src/shared/exportZip.test.ts` passed.
- `npm run typecheck` passed.

Task 6 content collection loop completed:
- Added popup/content message contracts in `src/shared/messages.ts`.
- Replaced the content script placeholder with an in-memory collection state, X bookmarks page guard, scan/merge loop, smooth scrolling, stop/clear handling, and unknown-operation error response.
- `npm run typecheck` passed.
- `npm test` passed.

Task 7 popup UI and downloads completed:
- Added popup controls for start, stop, clear, image attachment toggle, and zip export.
- Added status refresh while collection is running.
- Added zip download via Chrome downloads API.
- Added `https://pbs.twimg.com/*` host permission so image attachments from X media can be fetched.
- `npm run typecheck`, `npm test`, and `npm run build` passed.

Task 8 README and verification checklist completed:
- Added local development instructions.
- Documented privacy boundaries: no cloud account, no upload, no cookie access, no internal X API calls, no video downloads in v1.
- Documented usage and expected zip contents.
- Added manual validation checklist.

Implementation plan execution note:
- Execution started with subagent-driven development.
- After subagent usage limits were reached, remaining work continued inline using the approved plan and the same verification standards.

Live Chrome acceptance test completed:
- Loaded the unpacked extension from `dist/` in Chrome.
- Opened an authenticated X Bookmarks page at `https://x.com/i/bookmarks`.
- Verified the popup initially detected 4 loaded bookmarks.
- Ran guided collection once and verified it collected 20 bookmarks after 12 scroll attempts.
- Exported a zip from Chrome downloads and verified it contained JSON, combined Markdown, per-bookmark Markdown files, and image attachments.
- Found a real extraction issue with non-ASCII per-bookmark filenames, fixed it by switching export filenames to portable ASCII-safe slugs, rebuilt, reloaded the extension, and re-exported.
- Verified the fixed zip extracts with the system `unzip` command and preserves Chinese content inside Markdown/JSON.
- Current security audit status: `npm audit --audit-level=moderate` still reports 5 moderate dev-dependency findings in the Vite/esbuild/Vitest chain. npm's automatic fix requires a breaking upgrade to `vite@8.0.13`; this has not been applied.

V2 planning completed:
- Productization design spec written at `docs/superpowers/specs/2026-05-16-x-bookmarks-v2-productization-design.md`.
- Implementation plan written at `docs/superpowers/plans/2026-05-16-x-bookmarks-v2-productization.md`.
- V2 scope prioritizes Obsidian usefulness, traceable attachments, CSV/TXT/HTML outputs, bilingual UI, expressive popup polish, and complete README documentation.
- No feature code was changed during V2 planning.
