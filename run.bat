@echo off
echo ========================================================
echo Starting PayOps AI Backend Server
echo ========================================================
if not exist .venv\Scripts\uvicorn.exe (
    echo Virtual environment not found. Running setup.bat first...
    call setup.bat
)

echo API Documentation: http://127.0.0.1:8000/docs
echo ReDoc:              http://127.0.0.1:8000/redoc
echo Health Check:       http://127.0.0.1:8000/api/v1/health
echo.
.venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

