$ErrorActionPreference = 'Stop'
Write-Host 'Nila local setup'
function Test-Node22 { try { $v = (& node -p "process.versions.node.split('.')[0]") -as [int]; return $v -ge 22 } catch { return $false } }
if (-not (Test-Node22)) {
  if (Get-Command winget -ErrorAction SilentlyContinue) { Write-Host 'Installing Node.js LTS with winget...'; winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements; $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User') }
  else { throw 'Node.js 22+ is required and winget is unavailable. Install Node.js 22+ and rerun this command.' }
}
if (-not (Test-Node22)) { throw 'Node.js 22+ was not detected after installation.' }
New-Item -ItemType Directory -Force "$HOME\.nila\workspace" | Out-Null
npm install --no-audit --no-fund
npm update --no-audit --no-fund
npm run verify
Write-Host 'Setup complete. Start Nila with: npm run dev'
