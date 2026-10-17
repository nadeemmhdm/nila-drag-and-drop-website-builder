param([switch]$Start)
$ErrorActionPreference = 'Stop'

Write-Host 'Nila local setup' -ForegroundColor Cyan

function Refresh-Path {
  $machine = [System.Environment]::GetEnvironmentVariable('Path','Machine')
  $user = [System.Environment]::GetEnvironmentVariable('Path','User')
  $env:Path = "$machine;$user"
}

function Test-Node22 {
  try { return ([int](& node -p "process.versions.node.split('.')[0]")) -ge 22 } catch { return $false }
}

if (-not (Test-Node22)) {
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host 'Installing/updating Node.js LTS...'
    if (Get-Command node -ErrorAction SilentlyContinue) {
      winget upgrade --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
    } else {
      winget install --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
    }
    Refresh-Path
  } else {
    throw 'Node.js 22+ is required and winget is unavailable. Install Node.js 22+ and rerun setup.'
  }
}
if (-not (Test-Node22)) { throw 'Node.js 22+ was not detected after installation/update.' }

New-Item -ItemType Directory -Force "$HOME\.nila\workspace" | Out-Null
node "$PSScriptRoot\nila.mjs" repair

if ($Start) {
  Write-Host 'Starting Nila...'
  npm start
} else {
  Write-Host 'Setup complete. Start Nila with: npm start'
}
