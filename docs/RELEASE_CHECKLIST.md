# Release Checklist

Use this checklist before publishing a Nila tag or GitHub release.

## Source and validation

- [ ] Release version is consistent in `package.json`, application constants and release notes.
- [ ] Project schema changes are documented and migration/compatibility impact is understood.
- [ ] `npm run test` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] `npm run audit:prod` reports no high/critical production dependency vulnerabilities.
- [ ] CI is green on the exact release commit.

## Security

- [ ] Workspace import limits and validation are exercised with malformed cases.
- [ ] Uploaded asset allowlists/signature checks remain intact.
- [ ] Preview remains sandboxed without same-origin privileges.
- [ ] Unsafe URL-scheme tests pass.
- [ ] Generated/GitHub export path traversal tests pass.
- [ ] No credentials, tokens, private data or machine-specific paths appear in source or generated fixtures.
- [ ] GitHub integration still avoids force pushes and persistent tokens.

## Product smoke tests

- [ ] Create/edit/duplicate/delete nested elements.
- [ ] Undo/redo and responsive overrides work.
- [ ] Create multiple pages and navigate internal links.
- [ ] Upload supported media/font assets and reject unsupported files.
- [ ] Save, reload, backup and restore a local workspace.
- [ ] Export/import `.nila.json`.
- [ ] Open sandbox preview.
- [ ] Generate and inspect ZIP output.
- [ ] Build one generated website with `npm install && npm run build`.
- [ ] Verify generated SEO/discovery files and visible provenance.

## Documentation and release

- [ ] README and security documentation match current behavior.
- [ ] CHANGELOG contains the release entry.
- [ ] License and NOTICE files are present and canonical requirements are preserved.
- [ ] Release notes state pre-release/stability expectations accurately.
- [ ] Tag points to the verified `main` commit.
