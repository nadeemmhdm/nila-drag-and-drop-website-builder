# Nila Drag & Drop Website Builder

[![CI](https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder/actions/workflows/ci.yml)

Nila is a local-first, open-source visual website builder for creating responsive React + Vite + TypeScript websites while keeping ownership of the generated source code.

> **Release status:** `0.10.0-beta.1`. Project files and editor behavior may still evolve before the first stable release.

## What Nila provides

- Visual drag-and-drop editing with nested layout containers, layers, selection, copy/duplicate, delete, lock, hide, undo and redo.
- Responsive desktop, tablet and mobile editing with inherited style overrides.
- Reusable elements, complete sections and starter templates from a local catalog.
- Multi-page sites with slugs, home-page management, internal navigation, anchors and safe external links.
- Project-local images, video, fonts and a searchable Lucide icon library.
- SEO, AEO and GEO metadata with canonical URLs, Open Graph, JSON-LD, sitemap, robots, `llms.txt` and `security.txt` generation.
- Isolated generated-site preview, standalone React/Vite source generation, ZIP download and optional GitHub export.
- Local workspaces backed by IndexedDB with OPFS mirroring where supported, autosave, manual backups and `.nila.json` import/export.
- Production offline caching after the application has been loaded successfully at least once.
- No analytics or telemetry enabled by default.

Generated websites do **not** require the Nila editor at runtime.

## One-command install and run

The installer downloads or updates Nila, checks Git and Node.js, installs missing prerequisites when supported, installs missing npm packages, applies compatible package updates, runs the full verification suite, and then starts Nila automatically.

### Windows — PowerShell

```powershell
irm https://raw.githubusercontent.com/nadeemmhdm/nila-drag-and-drop-website-builder/main/install.ps1 | iex
```

### Linux / macOS

```bash
curl -fsSL https://raw.githubusercontent.com/nadeemmhdm/nila-drag-and-drop-website-builder/main/install.sh | bash
```

Default install location: `~/Nila`. Set `NILA_HOME` before running the installer to choose another location.

The installer only applies npm updates that stay within the compatible version ranges declared by the project. Major dependency upgrades are intentionally not forced during local installation.

## Simple commands

Run these from the Nila directory after installation:

| Command | Purpose |
| --- | --- |
| `npm start` | Start Nila and open it in the default browser. |
| `npm run update` | Pull the latest Nila source, install missing packages, apply compatible dependency updates, and verify everything. |
| `npm run repair` | Repair/reinstall local dependencies, apply compatible updates, and run full verification. |
| `npm run doctor` | Check Node.js, npm, Git, and the local Nila installation. |
| `npm run verify` | Run tests, TypeScript validation, production build, and production dependency security audit. |
| `npm run dev` | Start Nila without automatically opening a browser. |

The local server binds to `127.0.0.1` by default.

## Manual/local setup

Requirements:

- Node.js **22 or newer**.
- npm **10 or newer** is recommended.
- Git for source updates.

If the repository is already cloned:

### Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

### Linux / macOS

```bash
bash ./setup.sh
```

Manual npm setup is also supported:

```bash
npm install
npm run verify
npm start
```

## Local workspaces

Nila uses browser-managed local storage rather than unrestricted filesystem access. IndexedDB is authoritative; supported browsers also receive an Origin Private File System mirror using a structure equivalent to:

```text
workspace/
  <local-user>/
    <project-id>/
      project.nila.json
      backups/
```

The Local panel supports workspace switching, autosave, manual versioned backups, restore, import and export. See [Local workspaces](docs/LOCAL_WORKSPACES.md).

## Exported websites

The export pipeline creates a standalone React + Vite + TypeScript project containing:

- Page-specific HTML entry files.
- Generated React renderer and responsive CSS.
- Project-local assets and fonts.
- Search/discovery files under `public/`.
- `.nila/project.json` provenance metadata.
- A visible “Built with Nila Website Builder” credit.

ZIP export runs entirely in the browser. GitHub export is opt-in and uses the GitHub API only after the user supplies repository details and a token. The token is kept in component memory only and is never written into generated files or workspaces. See [Export format](docs/EXPORT_FORMAT.md).

## Security model

Project files, uploads, URLs and integration input cross trust boundaries and are validated accordingly. Notable controls include:

- Structured project state instead of persisted executable HTML.
- File extension, MIME and signature checks for uploaded assets.
- Explicit rejection of SVG uploads until sanitization is available.
- Unsafe URL-scheme blocking.
- Sandboxed preview without same-origin privileges.
- Bounded workspace imports with schema, tree-depth, node-count, asset-budget and path validation.
- Traversal-resistant generated and GitHub export paths.
- Runtime-only integration credentials.
- CI tests, production dependency audit, TypeScript checks and production builds.

See [Security Policy](SECURITY.md) and [Threat Model](docs/THREAT_MODEL.md).

## Repository structure

```text
src/
  core/          Project-level types and constants
  editor/        Visual editor, schema operations and UI
  exporter/      Preview, standalone source, ZIP and GitHub export
  offline/       Offline application bootstrap
  security/      Trust-boundary validation
  seo/           SEO/AEO/GEO audit and generators
  workspace/     IndexedDB/OPFS local workspace persistence
  styles/        Editor styles

tests/           Automated security, export, link and metadata tests
scripts/         Local setup, repair and update tooling
docs/            Architecture, workspace, export, hosting and release documentation
```

## Engineering principles

1. **Local first** — core editing does not require a hosted account.
2. **Offline capable** — after initial setup/load, core editing should remain useful without a remote service.
3. **Source ownership** — generated sites remain independent of Nila.
4. **Safe by default** — untrusted data is validated at trust boundaries and preview execution is isolated.
5. **Responsive by design** — desktop, tablet and mobile are first-class editor targets.
6. **Explicit integrations** — network actions are opt-in and credentials are not persisted implicitly.
7. **Open-source provenance** — redistributed third-party material must retain applicable licenses and attribution.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Product roadmap](docs/ROADMAP.md)
- [Local workspaces](docs/LOCAL_WORKSPACES.md)
- [Export format](docs/EXPORT_FORMAT.md)
- [Self-hosting](docs/SELF_HOSTING.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Security policy](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Changes should be focused, security-conscious, legally redistributable and pass `npm run verify`.

## License

Nila is licensed under the [Apache License 2.0](LICENSE). The canonical license text is kept unchanged. Third-party components, templates, fonts, icons and assets may have separate attribution requirements that must be preserved.
