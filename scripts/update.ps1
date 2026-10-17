$ErrorActionPreference = 'Stop'
git pull --ff-only
npm install --no-audit --no-fund
npm update --no-audit --no-fund
npm run check
Write-Host 'Nila updated and verified.'
