#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder.git"
INSTALL_DIR="${NILA_HOME:-$HOME/Nila}"

say(){ printf '\n%s\n' "$1"; }
need_sudo(){ [ "$(id -u)" -ne 0 ]; }
run_root(){ if need_sudo; then command -v sudo >/dev/null 2>&1 || { echo 'sudo is required to install system packages.' >&2; exit 1; }; sudo "$@"; else "$@"; fi; }

install_system_package(){
  local package="$1"
  if command -v brew >/dev/null 2>&1; then brew install "$package"
  elif command -v apt-get >/dev/null 2>&1; then run_root apt-get update; run_root apt-get install -y "$package"
  elif command -v dnf >/dev/null 2>&1; then run_root dnf install -y "$package"
  elif command -v pacman >/dev/null 2>&1; then run_root pacman -Sy --needed --noconfirm "$package"
  else echo "Install '$package' with your system package manager, then rerun this installer." >&2; exit 1; fi
}

node_ok(){ command -v node >/dev/null 2>&1 && [ "$(node -p "Number(process.versions.node.split('.')[0])")" -ge 22 ]; }

say 'Nila one-command installer'
printf 'Install directory: %s\n' "$INSTALL_DIR"

command -v git >/dev/null 2>&1 || install_system_package git
command -v curl >/dev/null 2>&1 || install_system_package curl

if ! node_ok; then
  if command -v brew >/dev/null 2>&1; then
    say 'Installing/updating Node.js...'
    if brew list node >/dev/null 2>&1; then brew upgrade node || true; else brew install node; fi
  else
    say 'Installing Node.js 22 with nvm...'
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

if [ -d "$INSTALL_DIR/.git" ]; then
  say 'Existing Nila installation found. Updating source...'
  if [ -n "$(git -C "$INSTALL_DIR" status --porcelain --untracked-files=no)" ]; then
    echo 'Tracked local source changes were detected. Commit or revert them before updating Nila.' >&2
    exit 1
  fi
  git -C "$INSTALL_DIR" checkout main
  git -C "$INSTALL_DIR" pull --ff-only
elif [ -e "$INSTALL_DIR" ] && [ -n "$(find "$INSTALL_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]; then
  echo "Install directory exists but is not a Nila Git repository: $INSTALL_DIR" >&2
  exit 1
else
  say 'Downloading Nila...'
  git clone --branch main --single-branch "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
bash ./setup.sh --start
