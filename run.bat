@echo off
echo ========================================================
echo Starting PayOps AI Backend Server (FastAPI)
echo ========================================================

:: Seed database demo data if not already present
python -m scripts.seed_demo_data

echo API Documentation: http://127.0.0.1:8000/docs
echo ReDoc:              http://127.0.0.1:8000/redoc
echo Health Check:       http://127.0.0.1:8000/api/v1/health
echo.

if exist .venv\Scripts\uvicorn.exe (
    .venv\Scripts\uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
) else (
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
)
