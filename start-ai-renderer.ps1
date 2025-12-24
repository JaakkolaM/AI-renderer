# Start AI Renderer with browser
Write-Host "Starting AI Renderer..." -ForegroundColor Green
Set-Location $PSScriptRoot

# Wait 3 seconds then open browser
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
} | Out-Null

# Start dev server
npm run dev


