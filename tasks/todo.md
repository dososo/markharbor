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

## Review

Chinese design spec written at `docs/superpowers/specs/2026-05-16-x-bookmarks-obsidian-exporter-design.md`.
Self-review found no placeholders or obvious contradictions. No implementation has started.

Implementation plan created at `docs/superpowers/plans/2026-05-16-x-bookmarks-obsidian-exporter.md`.
Next step is user approval of execution mode before code implementation.
