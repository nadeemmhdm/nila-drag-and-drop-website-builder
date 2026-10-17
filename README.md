# Nila Drag & Drop Website Builder

[![CI](https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder/actions/workflows/ci.yml)

Nila is a local-first, open-source visual website builder for creating responsive React + Vite + TypeScript websites while keeping ownership of the generated source code.

> **Project status:** Nila is under active development. The editor, project schema, and public APIs may evolve before a stable release.

## Overview

Nila is designed to make visual website building practical without locking projects to a hosted platform. The editor stores website structure as typed project data rather than arbitrary persisted HTML, providing a safer and more maintainable foundation for editing, previewing, exporting, and extending generated websites.

## Highlights

- Visual drag-and-drop website editing.
- Nested sections, containers, and content elements.
- Typed editor document model for safer project manipulation.
- Layers navigation and element selection.
- Duplicate, delete, lock, hide, undo, and redo controls.
- Mobile, tablet, and desktop editor viewports.
- Zoom controls and responsive-style foundations.
- Inspector-based content and basic style editing.
- Local-first architecture with no analytics or telemetry enabled by default.
- Generated websites are intended to remain independent of Nila at runtime.
- Extensible architecture for components, templates, assets, exporters, and integrations.

## Requirements

- Node.js **22 or newer**.
- npm **10 or newer** is recommended.
- Git is recommended for contributing and version control.

## Getting started

```bash
git clone https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder.git
cd nila-drag-and-drop-website-builder
npm install
npm run dev
```

The development server listens on `127.0.0.1` by default. Open:

```text
http://127.0.0.1:5173
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server. |
| `npm run typecheck` | Run the TypeScript compiler without emitting output. |
| `npm run build` | Typecheck and create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run check` | Run the repository's typecheck and production build validation. |

## Project structure

```text
src/
  core/                  Core constants and project-level types
  editor/                Visual editor engine and document model
    components/          Canvas, inspector, layers, and palette UI
    EditorShell.tsx      Main editor workspace
    history.ts           Undo/redo history utilities
    model.ts             Editor tree operations
    types.ts             Typed editor schema
  styles/                Application styles

docs/
  ARCHITECTURE.md        Architecture and design boundaries
  ROADMAP.md             Planned product development
  THREAT_MODEL.md        Security threat model
```

## Engineering principles

1. **Local first** — core editing should remain usable without requiring a hosted account.
2. **Offline capable** — after required local dependencies are installed, core editing should not depend on a remote service.
3. **Source ownership** — exported websites should not require Nila to run.
4. **Safe by default** — untrusted content must be validated and preview execution must be isolated from the editor.
5. **Responsive by design** — mobile, tablet, and desktop experiences are first-class concerns.
6. **Explicit integrations** — network services and external integrations must be opt-in and clearly documented.
7. **Open-source provenance** — redistributed third-party code and assets must retain applicable licenses and attribution.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Security policy](SECURITY.md)
- [Privacy](PRIVACY.md)
- [Contributing guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Support](SUPPORT.md)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Changes should be focused, security-conscious, legally redistributable, and validated with `npm run check`.

## Security

Please do not disclose vulnerabilities through public issues. Follow the private reporting guidance in [SECURITY.md](SECURITY.md).

## Privacy

The upstream project is designed without analytics or telemetry enabled by default. See [PRIVACY.md](PRIVACY.md) for the project's privacy principles.

## License

Nila is licensed under the [Apache License 2.0](LICENSE). Contributions submitted for inclusion in the project are handled under the terms described by that license unless explicitly stated otherwise.

Third-party components, templates, fonts, icons, and assets may be subject to their own licenses and attribution requirements. Those notices must be preserved where applicable.
