$ErrorActionPreference = 'Stop'
git pull --ff-only
npm install --no-audit --no-fund
npm update --no-audit --no-fund
npm run verify
Write-Host 'Nila updated and verified.'
