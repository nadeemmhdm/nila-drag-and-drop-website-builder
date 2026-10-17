# Changelog

All notable project changes are documented here. Nila follows pre-release semantic versioning while interfaces and the project schema continue to stabilize.

## [0.10.0-beta.1] - 2026-10-17

### Added
- Full visual editor with nested drag-and-drop, layers, history, responsive viewports and advanced style inspection.
- Local elements, reusable sections and starter templates.
- Multi-page routing with structured internal, external, anchor, email and phone links.
- Project-local image, video and font assets plus Lucide icons.
- SEO/AEO/GEO configuration, audits, JSON-LD and generated `robots.txt`, `sitemap.xml`, `llms.txt` and `security.txt`.
- Isolated generated-site preview, standalone React/Vite/TypeScript generation, ZIP download and GitHub export.
- IndexedDB workspaces, OPFS mirroring where available, autosave, backups and `.nila.json` import/export.
- Windows and Unix-like local setup/update scripts.
- Vitest regression suites for security validation, links, metadata generation and exports.

### Security
- Added strict workspace-import limits and structural validation.
- Added imported asset signature, path and total-size validation.
- Hardened GitHub owner, repository, branch, subdirectory and generated-path handling.
- Kept integration credentials out of persisted workspaces and generated output.
- Added production dependency auditing to CI and local verification.

### Changed
- Updated GitHub Actions Node setup to the current Node 24-based action generation while continuing to test the project on Node.js 22.
- Refreshed project architecture, setup, export, workspace and release documentation.

## [0.1.0-alpha.1] - 2026-10-17

### Added
- Initial React + Vite + TypeScript foundation.
- Responsive viewport constants and initial typed project schema.
- Architecture, privacy, threat-model, contribution and security documentation.
- Continuous integration and dependency update configuration.
