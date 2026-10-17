# Security Policy

## Supported versions

Nila is pre-release software. Security fixes currently target the latest `main` branch and the latest tagged release once releases begin.

## Reporting a vulnerability

Do not publish exploitable details in a public issue. Use GitHub's private vulnerability reporting/security advisory mechanism for this repository when available. Include impact, affected area, reproduction steps and a minimal proof of concept.

## Security baseline

Nila is designed around these requirements:

- Core local editing must not require telemetry or hidden network requests.
- External integrations are explicit and opt-in.
- Uploaded files are untrusted and must be validated before preview/export.
- SVG and rich content require sanitization before insertion into the DOM.
- `javascript:` and equivalent unsafe URL schemes must be rejected.
- Preview execution must be isolated from the editor.
- Tokens/secrets must never be written into exported website source or project ZIPs.
- Remote component code must never be executed merely because a registry returned it.

See `docs/THREAT_MODEL.md` for the evolving threat model.
