$ErrorActionPreference = 'Stop'

$RepoUrl = 'https://github.com/nadeemmhdm/nila-drag-and-drop-website-builder.git'
$InstallDir = if ($env:NILA_HOME) { $env:NILA_HOME } else { Join-Path $HOME 'Nila' }

function Refresh-Path {
  $machine = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [System.Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machine;$user"
}

function Ensure-WingetPackage([string]$Command, [string]$PackageId, [string]$Label) {
  if (Get-Command $Command -ErrorAction SilentlyContinue) { return }
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "$Label is required, but winget is unavailable. Install $Label and rerun this command."
  }
  Write-Host "Installing $Label..."
  winget install --id $PackageId --exact --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "$Label installation completed, but '$Command' is not available in this shell. Open a new PowerShell window and rerun the installer."
  }
}

Write-Host ''
Write-Host 'Nila one-command installer' -ForegroundColor Cyan
Write-Host "Install directory: $InstallDir"

Ensure-WingetPackage 'git' 'Git.Git' 'Git'
Ensure-WingetPackage 'node' 'OpenJS.NodeJS.LTS' 'Node.js LTS'

$nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
if ($nodeMajor -lt 22) {
  Write-Host 'Updating Node.js to a supported LTS version...'
  winget upgrade --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
  $nodeMajor = [int](& node -p "process.versions.node.split('.')[0]")
}
if ($nodeMajor -lt 22) { throw 'Nila requires Node.js 22 or newer.' }

if (Test-Path $InstallDir) {
  if (-not (Test-Path (Join-Path $InstallDir '.git'))) {
    $items = Get-ChildItem -Force $InstallDir -ErrorAction SilentlyContinue
    if ($items) { throw "Install directory exists but is not a Nila Git repository: $InstallDir" }
  }
}

if (-not (Test-Path (Join-Path $InstallDir '.git'))) {
  Write-Host 'Downloading Nila...'
  git clone --branch main --single-branch $RepoUrl $InstallDir
} else {
  Write-Host 'Existing Nila installation found. Updating source...'
  $dirty = git -C $InstallDir status --porcelain --untracked-files=no
  if ($dirty) { throw 'Tracked local source changes were detected. Commit or revert them before updating Nila.' }
  git -C $InstallDir checkout main
  git -C $InstallDir pull --ff-only
}

Set-Location $InstallDir
& (Join-Path $InstallDir 'setup.ps1') -Start
