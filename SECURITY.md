# Security Policy

Security is a core design requirement of Nila. The editor handles project data, local files, preview rendering, generated source code and optional external integrations; input crossing any of those boundaries is treated as untrusted by default.

## Supported versions

| Version | Security support |
| --- | --- |
| Latest tagged beta/release candidate | Supported |
| Latest `main` branch | Supported |
| Older pre-release builds and unsupported forks | Best effort only |

Users should reproduce a suspected issue against a currently supported revision when practical.

## Reporting a vulnerability

**Do not publish exploit details, credentials, private data or proof-of-concept attack code in a public issue.**

Use GitHub private vulnerability reporting / repository security advisories when available. If private reporting is unavailable, open a public issue containing only a request for a private communication channel; do not include sensitive technical details.

A useful private report includes the affected component, impact, realistic preconditions, minimal reproduction, affected revision/version, suggested mitigation when known, and whether the issue is already public.

## Current trust boundaries

### Workspace import and persistence

Imported `.nila.json` files are size-bounded and validated before use. Validation limits schema versions, pages, node count, nesting depth, asset count and total asset bytes; it also rejects unsafe object keys, invalid asset signatures, path traversal and broken font references. Invalid persisted IndexedDB records are ignored rather than trusted.

### Uploaded assets

Supported uploads use an allowlist of image, video and font extensions with MIME and magic-signature checks. SVG is intentionally rejected until a sanitizer is part of the trusted pipeline. Project-wide asset budgets limit memory/storage abuse.

### URLs and navigation

External URLs are normalized to HTTP(S), while `javascript:`, `data:`, `vbscript:`, `file:` and unsupported schemes are rejected. New-tab links use `noopener noreferrer`.

### Preview

Generated-site preview runs in a sandboxed iframe without same-origin privileges. Preview content must not gain access to editor state, local workspace storage or integration credentials.

### Export

Generated file paths are bounded and traversal-resistant. Standalone exports must not contain editor credentials, local machine paths or hidden telemetry. GitHub owner/repository/branch/subdirectory inputs are validated before requests are made.

### GitHub integration

GitHub export is an explicit user action. A supplied token is held in UI memory, sent only to `api.github.com`, cleared after a successful push, and is not written to IndexedDB, OPFS, ZIP exports or generated source. Users should prefer fine-grained tokens limited to the intended repository.

### Dependencies and CI

Pull requests and `main` run automated tests, strict TypeScript checks, a production build and a high/critical production-dependency audit. Dependency changes should be reviewed for provenance, maintenance and license compatibility.

## Security expectations for contributors

Do not introduce `eval`, dynamic execution of untrusted source, unsanitized HTML/SVG insertion, unsafe URL schemes, hard-coded credentials, broad silent network access, traversal outside allowed workspace/export paths, or credentials in generated output.

For security-sensitive changes run:

```bash
npm run verify
```

See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for the threat model and [CONTRIBUTING.md](CONTRIBUTING.md) for contribution requirements.

## Coordinated disclosure

Maintainers will validate reports, determine affected versions, develop or coordinate a fix and disclose details after users have had a reasonable opportunity to update. Please avoid public disclosure while a report is being actively remediated.

## Out of scope

Issues limited to intentionally modified forks, unsupported builds, third-party services outside Nila's control, or configurations that deliberately remove documented security boundaries may be out of scope unless they demonstrate an upstream defect.
