@echo off
echo ========================================================
echo  True Lens AI - Detect, Verify, Prevent
echo  Autonomous Digital Forensics & Misinformation Mitigation
echo ========================================================

echo Starting FastAPI Forensics Backend on port 8000...
start cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend on port 5173...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo True Lens AI is booting!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Web Application: http://localhost:5173
echo.
