@echo off
echo ==============================================
echo   VoiceFlow AI - Backend Startup
echo ==============================================

:: Check if virtual environment exists
if not exist "venv\" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
)

:: Activate venv
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat

:: Install dependencies
echo [3/3] Installing dependencies...
pip install -r requirements.txt --quiet

:: Start the server
echo.
echo ✅ Starting VoiceFlow AI Backend on http://localhost:8000
echo ✅ API Docs available at http://localhost:8000/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
