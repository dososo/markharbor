# Lessons

- 2026-05-16: Export features must be validated by knowledge-base usefulness, not just by file existence. For Obsidian workflows, verify that notes have useful structure, source traceability, media context, and an index that can be navigated after import.
- 2026-05-16: Product-facing Chrome extension work needs competitor and workflow research before polishing. A functional popup is not enough when the user expects a simple, attractive, repeatable export workflow.
- 2026-05-16: Do not call a browser extension feature fully complete when real Chrome E2E validation is blocked or partial. Separate automated/local validation from acceptance validation, and keep the task open until the user can confirm the manual Chrome checklist passes.
- 2026-05-16: Treat unresolved `npm audit` findings as fix tasks, not just documented caveats, when the user asks for validation. Upgrade the narrow vulnerable dependency chain and rerun audit, tests, typecheck, and build before reporting completion.
- 2026-05-16: Popup UX validation must start from a fresh user's mental model. Do not show pre-scan counts as "collected", do not expose internal scan-delta terminology, and ensure all error messages are stored as localization keys rather than frozen strings.
