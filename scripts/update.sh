#!/usr/bin/env bash
set -euo pipefail
git pull --ff-only
npm install --no-audit --no-fund
npm update --no-audit --no-fund
npm run check
echo 'Nila updated and verified.'
