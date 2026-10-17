# Local Workspaces

Nila is designed to work without an account or hosted project database.

## Storage model

IndexedDB is the authoritative local workspace store. When supported by the browser, Nila also mirrors project JSON into the Origin Private File System (OPFS). OPFS is browser-private storage; it is not an unrestricted path on the host computer.

The conceptual mirror layout is:

```text
workspace/<user-folder>/<project-id>/project.nila.json
workspace/<user-folder>/<project-id>/backups/<timestamp>.nila.json
```

User/project names are converted to safe path segments before OPFS access.

## Autosave and backups

Editor changes are autosaved after a short debounce. Autosave updates the current workspace without creating an unbounded history. **Save + backup** creates a versioned snapshot; Nila retains a bounded set of recent backups per workspace.

## Import and export

A workspace can be exported as `.nila.json` and imported later. Import is a trust boundary: Nila rejects oversized files, unsupported schema versions, excessive nesting/counts, invalid asset signatures, unsafe paths and other malformed structures before applying project state.

Do not manually edit `.nila.json` unless you understand the schema and validation rules.

## Browser data lifecycle

Browser storage can be cleared by the user, browser policies, storage pressure or profile deletion. Important projects should also be backed up as `.nila.json`, ZIP/generated source, or version-controlled source code.

## Privacy

Workspace data stays in browser-managed local storage unless the user explicitly exports it or invokes an external integration such as GitHub export. Nila does not require telemetry for workspace persistence.
