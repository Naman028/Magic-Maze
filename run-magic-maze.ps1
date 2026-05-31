param(
  [ValidateSet("preview", "dev")]
  [string]$FrontendMode = "preview",

  [switch]$Install
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

function Assert-Directory($Path, $Name) {
  if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
    throw "$Name directory not found: $Path"
  }
}

function Assert-NodeModules($Path, $Name) {
  $nodeModules = Join-Path $Path "node_modules"
  if (-not (Test-Path -LiteralPath $nodeModules -PathType Container)) {
    throw "$Name dependencies are missing. Re-run with: .\run-magic-maze.ps1 -Install"
  }
}

function Start-NpmJob($Name, $WorkingDirectory, $Arguments) {
  Start-Job -Name $Name -ArgumentList $WorkingDirectory, $Arguments -ScriptBlock {
    param($Directory, $NpmArguments)
    Set-Location -LiteralPath $Directory
    & npm @NpmArguments
  }
}

Assert-Directory $BackendDir "Backend"
Assert-Directory $FrontendDir "Frontend"

if ($Install) {
  Write-Host "Installing backend dependencies..."
  Push-Location $BackendDir
  npm install
  Pop-Location

  Write-Host "Installing frontend dependencies..."
  Push-Location $FrontendDir
  npm install
  Pop-Location
} else {
  Assert-NodeModules $BackendDir "Backend"
  Assert-NodeModules $FrontendDir "Frontend"
}

if ($FrontendMode -eq "preview") {
  Write-Host "Building frontend for preview..."
  Push-Location $FrontendDir
  npm run build
  Pop-Location
}

Write-Host ""
Write-Host "Starting Magic Maze services..."
Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:4173  (preview) or http://localhost:5173 (dev)"
Write-Host "Press Ctrl+C to stop both services."
Write-Host ""

$jobs = @()

try {
  $jobs += Start-NpmJob "backend" $BackendDir @("run", "dev")
  if ($FrontendMode -eq "preview") {
    $jobs += Start-NpmJob "frontend" $FrontendDir @("run", "preview")
  } else {
    $jobs += Start-NpmJob "frontend" $FrontendDir @("run", "dev")
  }

  while ($true) {
    foreach ($job in $jobs) {
      Receive-Job -Job $job | ForEach-Object {
        Write-Host "[$($job.Name)] $_"
      }
      if ($job.State -in @("Failed", "Stopped", "Completed")) {
        Receive-Job -Job $job -ErrorAction SilentlyContinue
        throw "$($job.Name) process exited with state $($job.State)."
      }
    }
    Start-Sleep -Milliseconds 400
  }
} finally {
  Write-Host ""
  Write-Host "Stopping Magic Maze services..."
  foreach ($job in $jobs) {
    Stop-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
  }
}
