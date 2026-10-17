# Security Policy

Security is a core design requirement of Nila. The project handles editable content, uploaded assets, preview rendering, generated source code, and optional external integrations, so all input that crosses a trust boundary must be treated as untrusted by default.

## Supported versions

| Version | Security support |
| --- | --- |
| Latest `main` branch | Supported |
| Latest tagged release, when available | Supported |
| Older commits, forks, and unsupported branches | Not guaranteed |

Security fixes are applied to actively maintained code. Users should reproduce issues against the latest supported revision before reporting whenever practical.

## Reporting a vulnerability

**Do not publish exploit details, credentials, private data, or proof-of-concept attack code in a public issue.**

Use GitHub's private vulnerability reporting or repository security advisory workflow when it is available for this repository.

If private reporting is not available, open a public issue containing only a minimal request for a private communication channel. Do not include sensitive technical details in that issue.

A useful security report should include:

- A clear description of the vulnerability.
- The affected component, file, feature, or workflow.
- Security impact and realistic attack conditions.
- Reproduction steps using the minimum data required.
- A minimal proof of concept when safe to share privately.
- Any known mitigations or suggested fixes.
- Whether the issue is already publicly known.

## Coordinated disclosure

Maintainers will assess valid reports, determine severity and affected versions, develop or coordinate a fix, and disclose details when users have a reasonable opportunity to update. Please avoid public disclosure while a report is being actively investigated and remediated.

## Security boundaries

Nila's security model includes the following boundaries:

- **Project data:** persisted editor state must use structured, validated data rather than trusted arbitrary executable content.
- **Uploaded assets:** file names, MIME types, file contents, SVG, and metadata must be considered untrusted.
- **Rich content:** HTML-like or rich content must be sanitized before DOM insertion.
- **URLs:** dangerous schemes such as `javascript:` and equivalent unsafe values must be rejected.
- **Preview:** generated or user-controlled preview content must be isolated from privileged editor state.
- **Exports:** credentials, access tokens, local paths, and application secrets must never be embedded in generated websites or project archives.
- **External registries:** remote component metadata or source must not be executed merely because it was returned by a registry.
- **Integrations:** GitHub and other external integrations must follow least-privilege authorization and explicit user intent.
- **Local workspaces:** path traversal and writes outside an allowed project workspace must be prevented.
- **Dependencies:** dependency changes must be reviewed for provenance, maintenance, and supply-chain risk.

## Security expectations for contributors

Contributions that process untrusted data should include validation at the trust boundary rather than relying only on downstream components. Avoid introducing `eval`, dynamic code execution, unsafe HTML injection, silent network calls, hard-coded secrets, or overly broad integration permissions.

Before submitting security-sensitive changes, run:

```bash
npm run check
```

See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for the broader threat model and [CONTRIBUTING.md](CONTRIBUTING.md) for contribution requirements.

## Out of scope

Reports about unsupported forks, intentionally modified builds, third-party services outside Nila's control, or vulnerabilities that require a user to deliberately disable documented security controls may be treated as out of scope unless they demonstrate an upstream defect.
