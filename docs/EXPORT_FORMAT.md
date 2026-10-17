# Export Format

Nila exports a standalone React + Vite + TypeScript website project. The generated site has no runtime dependency on the Nila editor.

## Typical output

```text
package.json
vite.config.ts
index.html
<page-slug>/index.html
src/
  App.tsx
  main.tsx
  site-data.ts
  styles.css
  assets.ts
  assets/
    media/
    fonts/
public/
  robots.txt
  sitemap.xml
  llms.txt
  .well-known/security.txt
  assets/media/
.nila/
  project.json
```

Additional page entry points and assets are generated as needed.

## Provenance

Generated HTML includes generator metadata/comments, `package.json` records that the project was Nila-generated, `.nila/project.json` stores generator/project metadata, and the rendered site includes a visible “Built with Nila Website Builder” credit.

This provenance is transparent; Nila does not add hidden tracking or fingerprinting.

## ZIP export

ZIP generation runs locally in the browser. Project files are converted into an archive without uploading the project to Nila infrastructure.

## GitHub export

GitHub export uses an explicitly supplied owner, repository, branch, optional subdirectory and token. Nila validates destination and file paths, creates blobs/tree/commit through the Git Data API and updates the branch without a force push.

Tokens are transient and are not included in the generated project or workspace persistence. Prefer a fine-grained token scoped only to the target repository and required contents permission.

## Search and metadata files

`robots.txt`, `sitemap.xml`, `llms.txt`, `security.txt`, canonical metadata, Open Graph metadata and JSON-LD are generated from the same typed SEO configuration used by the editor audit.
