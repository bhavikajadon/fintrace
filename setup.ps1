$ErrorActionPreference = "Stop"
Write-Host "FINTRACE setup" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ is required." }
node --version
npm --version
npm install
npm run seed
Write-Host "Setup complete. Run: npm run dev" -ForegroundColor Green
