#!/usr/bin/env bash
set -euo pipefail
echo 'Nila local setup'
node_ok(){ command -v node >/dev/null 2>&1 && [ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ]; }
if ! node_ok; then
  if command -v nvm >/dev/null 2>&1; then nvm install 22 && nvm use 22
  elif command -v fnm >/dev/null 2>&1; then fnm install 22 && fnm use 22
  elif command -v apt-get >/dev/null 2>&1; then sudo apt-get update && sudo apt-get install -y nodejs npm
  elif command -v dnf >/dev/null 2>&1; then sudo dnf install -y nodejs npm
  elif command -v pacman >/dev/null 2>&1; then sudo pacman -S --needed nodejs npm
  else echo 'Node.js 22+ is required. Install it with your trusted package manager and rerun.' >&2; exit 1; fi
fi
if ! node_ok; then echo 'Installed Node.js is older than 22. Install Node.js 22+ and rerun.' >&2; exit 1; fi
mkdir -p "$HOME/.nila/workspace"
npm install --no-audit --no-fund
npm update --no-audit --no-fund
npm run verify
echo 'Setup complete. Start Nila with: npm run dev'
