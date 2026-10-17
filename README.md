# Nila Drag & Drop Website Builder

Nila is a local-first, open-source visual website builder that will generate clean React + Vite + TypeScript websites with source-code ownership.

> Status: **Phase 1 / 10 — Foundation**

## Phase 1 scope

- React + Vite + TypeScript foundation.
- Local-only development server by default (`127.0.0.1`).
- Responsive editor viewport constants for mobile, tablet and desktop.
- Initial project/page schema.
- Repository governance, security, contribution and architecture docs.
- GitHub Actions build/typecheck CI.
- No analytics, telemetry, remote fonts or runtime MCP dependency.

## Requirements

- Node.js 22 or newer.
- npm 10 or newer is recommended.

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Product principles

1. **Local first** — projects must remain usable without a hosted account.
2. **Offline capable** — core editing must not depend on an external service.
3. **Source ownership** — exported websites must not require Nila at runtime.
4. **Safe by default** — no arbitrary remote code execution in the editor or preview.
5. **Responsive by design** — mobile, tablet and desktop editing are first-class.
6. **Open-source provenance** — third-party components must keep valid license notices.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Security

See [`SECURITY.md`](SECURITY.md) and [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

## License

Apache License 2.0. See [`LICENSE`](LICENSE).
