@echo off
echo ========================================================
echo PayOps AI - Automated Setup and Model Downloader
echo ========================================================

:: 1. Virtual Environment Setup
echo [1/4] Setting up Python 3.12 virtual environment...
uv venv --python 3.12 .venv
if %ERRORLEVEL% NEQ 0 (
    echo Error creating virtual environment. Please ensure uv is installed.
    exit /b %ERRORLEVEL%
)

:: 2. Dependencies
echo [2/4] Installing backend dependencies...
uv sync
if %ERRORLEVEL% NEQ 0 (
    echo Error syncing packages.
    exit /b %ERRORLEVEL%
)

:: 3. Environment configuration
echo [3/4] Checking environment configuration...
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example
) else (
    echo .env file already exists.
)

:: 4. Ollama Model Downloads
echo [4/4] Downloading local Ollama AI models (Llama 3.2 1B and Qwen2.5-VL 3B)...
where ollama >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Pulling Llama 3.2 1B (Text reasoning and tools)...
    ollama pull llama3.2:1b
    echo Pulling Qwen2.5-VL 3B (Document and image extraction)...
    ollama pull qwen2.5-vl:3b
    echo Local AI models ready!
) else (
    echo [WARNING] Ollama command-line tool not found on PATH.
    echo Please install Ollama from https://ollama.com and run:
    echo   ollama pull llama3.2:1b
    echo   ollama pull qwen2.5-vl:3b
)

echo ========================================================
echo PayOps AI setup complete!
echo Run 'run.bat' to start the development server.
echo ========================================================
