# Threat Model

## Assets to protect

- User project source and uploaded assets.
- Local project metadata and backups.
- Integration credentials such as future GitHub tokens.
- The editor origin and browser storage.
- Exported website integrity.

## Primary threats

1. Malicious HTML/SVG/script content imported through user input.
2. Unsafe external URLs or iframe content.
3. Path traversal or filename confusion during local asset/export operations.
4. Dependency or component-registry supply-chain compromise.
5. Leaking integration credentials into logs, browser exports or generated source.
6. Generated websites inheriting unsafe editor-only capabilities.

## Mandatory mitigations for later phases

- Schema validation at project boundaries.
- Safe filename normalization and project-root confinement.
- MIME/type/size validation for uploads.
- SVG sanitization or safe rasterization strategy.
- Sandboxed preview context with a minimal capability set.
- Local vetted component registry with license metadata.
- Secret redaction and least-privilege integration scopes.
- CSP/security headers for hosted deployments.
