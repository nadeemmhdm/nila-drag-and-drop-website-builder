# Self-hosting Nila

Nila is a static React/Vite application. It can be served from a static host after a production build.

## Build

```bash
npm install
npm run verify
npm run build
```

Serve the generated `dist/` directory over HTTPS.

## Recommended HTTP headers

Configure these at the hosting platform or reverse proxy rather than assuming a meta tag can provide equivalent protection:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

A Content Security Policy should be tested against the exact deployment because the editor uses inline style attributes for visual editing and performs explicit GitHub API requests when the GitHub export feature is used. Start from a restrictive policy and add only the origins/features required by the deployment.

## Offline cache

The production service worker caches same-origin GET responses and provides an application-shell fallback. Test cache invalidation when changing deployment paths or proxy behavior.

## GitHub export network access

If GitHub export is enabled, clients need outbound HTTPS access to `https://api.github.com`. No GitHub credential should be placed in server environment variables for the browser editor; the integration is designed around explicit user-provided credentials.

## Hosted multi-user deployments

The current workspace layer is browser-local. Sharing a URL does not create shared project storage. A future collaboration backend should be designed as a separate trust boundary rather than treating local IndexedDB/OPFS as multi-user storage.
