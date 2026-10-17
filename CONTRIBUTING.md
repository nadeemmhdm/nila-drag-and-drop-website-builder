# Contributing to Nila

Thank you for contributing to Nila. Contributions may include bug fixes, editor improvements, components, templates, documentation, tests, accessibility improvements, security hardening, and development tooling.

Please keep contributions focused, reviewable, secure, and legally redistributable.

## Before you start

- Read the [README](README.md) for project goals and local setup.
- Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before making architectural changes.
- Review [SECURITY.md](SECURITY.md) and [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for security-sensitive work.
- Search existing issues and pull requests before starting duplicate work.
- Discuss large architectural, dependency, schema, or product changes before investing in a large implementation.

## Development requirements

- Node.js **22 or newer**.
- npm **10 or newer** is recommended.
- Git for source control.

## Local setup

```bash
git clone https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder.git
cd nila-drag-and-drop-website-builder
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run check
```

This validates the TypeScript project and production build.

## Repository structure

```text
src/core/              Core constants and project-level types
src/editor/            Editor state, schema, operations, and workspace UI
src/editor/components/ Canvas, inspector, layers, and palette components
src/styles/            Application styles
docs/                  Architecture, roadmap, and security design documents
.github/                CI, issue templates, and pull-request templates
```

## Development workflow

1. Create a branch from the latest `main` branch.
2. Use a clear branch name such as `feat/...`, `fix/...`, `docs/...`, `refactor/...`, or `security/...`.
3. Keep each pull request focused on one logical change.
4. Rebase or update your branch when needed so validation reflects current `main`.
5. Run `npm run check` locally.
6. Open a pull request with a clear summary, rationale, testing notes, and any security or compatibility considerations.
7. Address review comments with additional commits or updates to the existing branch.

Direct changes to protected branches should be avoided; use the pull-request workflow.

## Code expectations

Contributions should:

- Preserve strict TypeScript safety and avoid unnecessary type escapes.
- Keep editor project data structured and serializable.
- Avoid storing arbitrary executable HTML or JavaScript as trusted project state.
- Keep UI behavior accessible and keyboard-friendly where applicable.
- Preserve responsive behavior across supported editor viewports.
- Avoid hidden telemetry, tracking, or unexpected network access.
- Keep external integrations explicit and least-privileged.
- Add comments for non-obvious security or architectural decisions rather than restating simple code.
- Avoid unrelated refactors in a focused bug fix or feature pull request.

## Dependencies

New dependencies increase maintenance and supply-chain risk. Add a dependency only when it provides clear value that would be costly or error-prone to implement locally.

When adding or upgrading a dependency:

- Prefer actively maintained packages with a clear license and provenance.
- Keep the dependency scope as small as practical.
- Avoid packages that require unnecessary runtime network access.
- Explain significant new dependencies in the pull request.
- Confirm compatibility with the repository's supported Node.js version and build process.

## Components, templates, fonts, icons, and assets

Only contribute material that the project is legally allowed to redistribute.

- Do not copy paid, proprietary, or source-restricted components without explicit redistribution rights.
- Preserve copyright, license, and attribution notices required by third-party licenses.
- Clearly document the source and license of imported open-source material when attribution is required.
- Do not remove upstream license notices from adapted code.
- Prefer original assets or assets with licenses compatible with project redistribution.

## Security-sensitive contributions

Treat user-controlled input, uploaded files, remote registry data, URLs, preview content, project paths, and integration credentials as untrusted.

Do not introduce:

- `eval` or equivalent arbitrary code execution.
- Unsanitized rich HTML or SVG insertion.
- Unsafe URL schemes.
- Hard-coded credentials or tokens.
- Secrets inside generated site exports.
- Path traversal outside a permitted project workspace.
- Silent remote execution of registry-provided source code.

For vulnerabilities, do **not** open a public issue containing exploit details. Follow [SECURITY.md](SECURITY.md).

## Pull request checklist

Before requesting review, confirm that:

- [ ] The change is focused and clearly described.
- [ ] `npm run check` passes.
- [ ] User-visible behavior is documented where necessary.
- [ ] Security boundaries affected by the change were considered.
- [ ] No credentials, secrets, personal data, or machine-specific paths were committed.
- [ ] New third-party code or assets are legally redistributable and properly attributed.
- [ ] Accessibility and responsive behavior were considered for UI changes.
- [ ] Breaking schema or architecture changes are explicitly called out.

## Licensing of contributions

Unless you explicitly state otherwise, contributions intentionally submitted for inclusion in Nila are provided under the terms described by the project's [Apache License 2.0](LICENSE), consistent with the license's contribution provisions.

## Community standards

Participation in the project is subject to the [Code of Conduct](CODE_OF_CONDUCT.md).
