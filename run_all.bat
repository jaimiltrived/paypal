@echo off
echo ========================================================
echo Launching PayOps AI Full Stack (FastAPI + React Console)
echo ========================================================

:: 1. Start Backend in separate window
start "PayOps AI Backend (Port 8000)" cmd /k "call run.bat"

:: 2. Start Frontend Vite Dev Server in separate window
start "PayOps AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Both services launched in separate windows!
echo Backend API:  http://127.0.0.1:8000
echo Swagger Docs: http://127.0.0.1:8000/docs
echo Frontend App: http://localhost:5173
echo ========================================================
pause
