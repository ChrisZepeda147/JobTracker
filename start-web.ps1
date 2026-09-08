# Start the JobTracker web dashboard (Next.js)
Set-Location $PSScriptRoot\web
if (-not (Test-Path node_modules)) {
    Write-Host "Installing web dependencies (first run)..."
    npm install
}
Write-Host "Starting dev server at http://localhost:3000"
npm run dev
