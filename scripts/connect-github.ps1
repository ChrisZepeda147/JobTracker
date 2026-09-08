# Connect JobTracker to GitHub (one-time setup).
# Run from project root:  .\scripts\connect-github.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$gh = Join-Path $root ".tools\gh\bin\gh.exe"
if (-not (Test-Path $gh)) {
    Write-Host "Downloading GitHub CLI..."
    $tools = Join-Path $root ".tools\gh"
    New-Item -ItemType Directory -Force -Path $tools | Out-Null
    $zip = Join-Path $env:TEMP "gh.zip"
    Invoke-WebRequest -Uri "https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_windows_amd64.zip" -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $tools -Force
}

Write-Host "Signing in to GitHub (browser window will open)..."
& $gh auth login -h github.com -p https -w

Write-Host "Creating private repo and pushing..."
& $gh repo create JobTracker --private --source=. --remote=origin --push

Write-Host ""
Write-Host "Done. Remote:"
git remote -v
