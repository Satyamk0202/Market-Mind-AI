@echo off
echo.
echo ╔══════════════════════════════════════╗
echo ║      MarketMIND — Backend Setup      ║
echo ╚══════════════════════════════════════╝
echo.

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install from https://python.org
    pause
    exit /b
)

echo Python found.

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies...
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo.
echo All dependencies installed!
echo.
echo Starting MarketMIND API server...
echo URL: http://localhost:5000
echo Press Ctrl+C to stop
echo.

python app.py
pause
