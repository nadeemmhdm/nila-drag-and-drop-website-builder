# Contributing to Nila

Thank you for contributing. Changes may include editor improvements, components, templates, tests, documentation, accessibility work, security hardening and development tooling. Keep contributions focused, reviewable, secure and legally redistributable.

## Before you start

- Read the [README](README.md) and [Architecture](docs/ARCHITECTURE.md).
- Review [SECURITY.md](SECURITY.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for security-sensitive work.
- Search existing issues and pull requests before duplicating work.
- Discuss large schema, architecture or dependency changes before investing in a large implementation.

## Requirements and setup

Node.js 22+ is required. npm 10+ is recommended.

```bash
git clone https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder.git
cd nila-drag-and-drop-website-builder
npm install
npm run verify
npm run dev
```

`npm run verify` runs automated tests, TypeScript validation, the production build and the production dependency security audit.

## Pull-request workflow

1. Branch from the latest `main`.
2. Use a focused branch name such as `feat/...`, `fix/...`, `docs/...`, `refactor/...` or `security/...`.
3. Keep one logical change per pull request where practical.
4. Add or update tests for behavior and security boundaries affected by the change.
5. Run `npm run verify` locally.
6. Open a pull request with rationale, testing notes, compatibility impact and relevant security considerations.
7. Resolve review feedback on the existing branch.

Do not bypass protected-branch controls for normal development.

## Code expectations

Contributions should preserve strict TypeScript safety, structured serializable editor data, local-first behavior, accessible interaction patterns, responsive behavior and explicit network integrations. Avoid arbitrary executable project state, hidden telemetry, unnecessary type escapes and unrelated refactors.

## Tests

Tests live under `tests/` and use Vitest. Security-sensitive parsers, URL handling, project generation and metadata generation should have deterministic unit coverage. A bug fix should include a regression test when the affected behavior can be isolated reasonably.

Run:

```bash
npm run test
npm run typecheck
npm run build
npm run audit:prod
```

## Dependencies

New dependencies increase supply-chain and maintenance risk. Prefer actively maintained packages with a clear license and provenance. Keep dependency scope small, avoid unnecessary runtime network access and explain significant additions in the pull request.

## Third-party components and assets

Only contribute material Nila may legally redistribute. Do not copy paid, proprietary or source-restricted components without explicit rights. Preserve required copyright, license and attribution notices for open-source code, fonts, icons and media.

## Security-sensitive changes

Treat workspace files, uploads, registry data, URLs, preview content, export paths and integration credentials as untrusted. Validation belongs at the trust boundary, not only at the final rendering layer.

Never commit credentials, secrets, personal data or machine-specific private paths. For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of publishing exploit details.

## Pull-request checklist

- [ ] `npm run verify` passes.
- [ ] Behavior changes have appropriate tests.
- [ ] Security boundaries affected by the change were reviewed.
- [ ] No credentials, secrets, personal data or machine-specific private paths were committed.
- [ ] New third-party material is legally redistributable and properly attributed.
- [ ] Accessibility and responsive behavior were considered for UI changes.
- [ ] Breaking schema or architecture changes are documented.
- [ ] User-facing documentation is updated when necessary.

## Licensing of contributions

Unless explicitly stated otherwise, contributions intentionally submitted for inclusion in Nila are provided under the terms described by the project's [Apache License 2.0](LICENSE), consistent with its contribution provisions.

Participation is subject to the [Code of Conduct](CODE_OF_CONDUCT.md).
