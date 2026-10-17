# Architecture

## Goal

Nila separates the privileged visual editor from generated website source. The editor stores structured project data; preview/export layers render that data without making arbitrary user-provided source code part of trusted editor execution.

## Modules

```text
src/
  core/          project-level types and version constants
  editor/        canvas, drag/drop, history, catalog and inspector UI
  exporter/      standalone React/Vite generation, preview, ZIP and GitHub export
  offline/       production offline bootstrap
  security/      workspace/import trust-boundary validation
  seo/           SEO/AEO/GEO audit and metadata/file generators
  workspace/     IndexedDB and OPFS persistence
  styles/        editor UI styling
```

## Editor data model

Pages contain typed node trees. Nodes have a known element type, serializable props, responsive style maps and child nodes. Project state does not persist executable JavaScript or arbitrary trusted HTML.

Desktop styles are the base. Tablet overrides inherit desktop values; mobile overrides inherit desktop and tablet values. Export generation preserves this model as deterministic CSS.

## Local workspace boundary

IndexedDB is the authoritative browser persistence layer. When Origin Private File System is available, Nila mirrors project JSON using the conceptual structure:

```text
workspace/
  <local-user>/
    <project-id>/
      project.nila.json
      backups/
```

Imported workspace files are validated before becoming editor state. Browser deployments never assume unrestricted host filesystem access.

## Asset boundary

Uploads use an explicit extension allowlist, MIME consistency checks and magic signatures. Imported workspace assets are revalidated, including safe project paths and total asset budget. SVG remains disabled until a sanitizer is part of the trusted pipeline.

## Preview boundary

The production preview uses `iframe srcDoc` with a sandbox that permits scripts/forms required by the generated preview but does not grant same-origin privileges. It receives generated site content rather than privileged editor application state.

## Export boundary

The exporter creates a standalone React + Vite + TypeScript project. Generated websites do not import the Nila editor. ZIP creation is browser-local. GitHub export validates its destination and generated file tree before an explicit network request.

## Integration credentials

Integration credentials are transient UI input. GitHub tokens are not part of project state, local persistence or generated artifacts. External integrations should follow the same explicit, least-privilege model.

## Offline behavior

A same-origin service worker provides production offline caching after an initial successful application load. Local projects remain in IndexedDB/OPFS and are independent from the network cache.

## Security invariants

- Validate untrusted data at ingress.
- Keep preview content isolated from privileged editor state.
- Reject traversal and executable URL schemes.
- Never embed secrets in exported websites.
- Keep remote integrations opt-in.
- Preserve generated-site independence from Nila.
- Keep third-party provenance and licensing explicit.
