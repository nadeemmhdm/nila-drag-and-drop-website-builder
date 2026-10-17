# Architecture

## Goal

Nila separates the visual editor from generated website source. The editor stores structured project data; exporters turn that data into readable React + Vite projects.

## Planned modules

```text
src/
  app/             application shell and routes
  editor/          canvas, selection, drag/drop, history
  schema/          validated project/page/node models
  registry/        trusted local components/sections/templates
  assets/          project asset pipeline
  preview/         isolated site renderer
  exporter/        React/Vite source + ZIP generation
  seo/             SEO/AEO/GEO and metadata generators
  integrations/    explicit opt-in external integrations
```

## Runtime boundary

The finished local editor must remain functional with no internet connection. Remote registries or MCP services may be used by maintainers to synchronize eligible open components, but the published Nila application consumes a vetted local catalog.

## Project workspace

A future local workspace will be isolated per user/project. Conceptually:

```text
workspace/
  <local-user>/
    <project-id>/
      project.nila.json
      assets/
      backups/
      export/
```

Browser-only deployments will use a browser-safe equivalent (IndexedDB / Origin Private File System where available) rather than assuming unrestricted filesystem access.

## Generated website

Generated code must be standalone. Assets uploaded through Nila are copied into the generated project's public/src asset directories as appropriate. No exported website may depend on the Nila editor being online.

## Security boundary

Project data is treated as untrusted input. Raw HTML, SVG, URLs, uploaded files and future external component sources must be validated/sanitized before rendering or export.
