@echo off
echo ========================================================
echo Launching PayOps AI Full Stack (FastAPI + React Console)
echo ========================================================

:: 1. Start Backend in separate window
start "PayOps AI Backend (Port 8000)" cmd /k "call run.bat"

:: 2. Start Frontend Vite Dev Server in current window
cd frontend
echo Starting React Vite Frontend Console at http://localhost:5173 ...
npm run dev

