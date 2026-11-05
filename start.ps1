Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " True Lens AI - Detect, Verify, Prevent" -ForegroundColor White
Write-Host " Autonomous Digital Forensics & Misinformation Mitigation" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "Starting FastAPI Forensics Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Vite React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nTrue Lens AI is running!" -ForegroundColor Green
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Web Application:  http://localhost:5173" -ForegroundColor Cyan
