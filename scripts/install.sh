#!/usr/bin/env bash
set -euo pipefail

START=false
if [ "${1:-}" = "--start" ]; then START=true; fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo 'Nila local setup'
node_ok(){ command -v node >/dev/null 2>&1 && [ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ]; }

if ! node_ok; then
  if command -v brew >/dev/null 2>&1; then
    if brew list node >/dev/null 2>&1; then brew upgrade node || true; else brew install node; fi
  else
    command -v curl >/dev/null 2>&1 || { echo 'curl is required to install Node.js automatically.' >&2; exit 1; }
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
      curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    fi
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
    nvm install 22
    nvm use 22
  fi
fi

node_ok || { echo 'Nila requires Node.js 22 or newer.' >&2; exit 1; }
mkdir -p "$HOME/.nila/workspace"
cd "$ROOT_DIR"
node "$SCRIPT_DIR/nila.mjs" repair

if [ "$START" = true ]; then
  echo 'Starting Nila...'
  npm start
else
  echo 'Setup complete. Start Nila with: npm start'
fi
