# ShadcnSpace MCP Integration

Nila can optionally connect to the official ShadcnSpace MCP endpoint to browse the live component and block registry without making ShadcnSpace a runtime dependency of generated websites.

## Access modes

- **Free mode:** no token is required. Nila requests free resources exposed by the ShadcnSpace MCP server.
- **Licensed mode:** enter your own ShadcnSpace MCP token in the Nila UI. The token is held in memory only and is forwarded to the MCP bridge for the current session.
- **Pages / PRO resources:** availability is controlled by the ShadcnSpace account and license associated with the supplied token. Nila does not bypass license checks.

## Where to find it

- **Elements → ShadcnSpace MCP** for components.
- **Sections → ShadcnSpace MCP** for blocks and animated blocks.
- **Templates → ShadcnSpace MCP** for ShadcnSpace Pages when the connected account permits them.

## Security model

The MCP bridge:

- runs only when the user explicitly connects or searches the ShadcnSpace library;
- talks to `https://mcp.shadcnspace.com/mcp`;
- is exposed to the Nila browser only through a localhost-only Vite middleware endpoint;
- accepts only an allowlist of ShadcnSpace catalog/install MCP tools;
- limits request body and token sizes;
- validates request origins;
- does not write the ShadcnSpace token to the Nila workspace, IndexedDB, exported projects, source files, or command-line arguments;
- uses a pinned `mcp-remote` bridge version rather than automatically executing an unpinned latest version.

The token is cleared when the Nila process/browser session is restarted.

## Source and install metadata

For supported items Nila can request the official MCP install metadata, including the information returned by ShadcnSpace for npm installation, imports, usage/JSX and Base UI or Radix UI style variants.

ShadcnSpace components are external React/shadcn source, not Nila-native structured editor nodes. Nila does not pretend arbitrary external TSX is safely drag-editable. Native Nila elements and blocks remain fully structured and visually editable; ShadcnSpace MCP items retain their official source/install workflow.

## Offline behavior

The ShadcnSpace library requires an internet connection when it is used. The rest of Nila remains local-first and continues to work without this connector after the normal application dependencies are installed.
