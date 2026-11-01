@echo off
echo ========================================================
echo  MediStock - Medicine Demand & Expiry Predictor
echo  MCA Python Mini Project Setup & Execution Script
echo ========================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

REM 2. Create and activate virtual environment
if not exist "venv" (
    echo [1/4] Creating Python virtual environment (venv)...
    python -m venv venv
)

echo [2/4] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/4] Installing dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo ========================================================
echo  IMPORTANT: Ensure MySQL Server is running on localhost!
echo  Import database.sql using MySQL Workbench or CLI:
echo  mysql -u root -p < database.sql
echo ========================================================
echo.

echo [4/4] Starting MediStock Flask Web Application...
python app.py

pause
