# Changelog

All notable changes to MarkHarbor will be documented in this file.

This project follows a practical versioned release style. Public release tags should use `vMAJOR.MINOR.PATCH`.

## [0.1.11] - 2026-05-17

### Changed

- Updated GitHub Actions runtime actions to the current major versions.
- Updated development dependencies: `@types/node`, `@types/chrome`, `jsdom`, and `typescript`.

### Fixed

- Added CSS side-effect import typing for TypeScript 6.
- Adjusted Chrome API wrapper and popup tests for newer Chrome type declarations.

## [0.1.10] - 2026-05-17

### Added

- GitHub-ready project name: MarkHarbor.
- Local-first X Bookmarks to Obsidian positioning.
- Bilingual README structure.
- Extension package version `0.1.10`.

### Changed

- Renamed package metadata to `markharbor`.
- Renamed Chrome extension display name to `MarkHarbor`.
- Renamed popup title and generated export titles to MarkHarbor branding.

## [0.1.9] - 2026-05-17

### Changed

- Clarified collection counters as `Discovered`, `Discovered this run`, and `Details done`.
- Split list discovery progress from detail enhancement progress.

## [0.1.8] - 2026-05-17

### Changed

- Added visible startup feedback after clicking start collection.
- Improved popup collection status visibility.

## [0.1.7] - 2026-05-17

### Fixed

- Improved X Article snapshot accumulation across virtualized scrolling.
- Tightened target matching for X Article detail enhancement.

## [0.1.0] - 2026-05-16

### Added

- Initial Chrome extension prototype.
- X Bookmarks collection from loaded page content.
- Obsidian-oriented Markdown, JSON, CSV, TXT, HTML, media manifest, and export report.
- Image attachment packaging.
- Chinese and English popup UI.
