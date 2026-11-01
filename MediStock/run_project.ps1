# ====================================================================
# MediStock – Medicine Demand & Expiry Predictor
# Windows PowerShell Execution Script
# MCA Python Mini Project
# ====================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  MediStock: Medicine Demand & Expiry Predictor" -ForegroundColor Green
Write-Host "  MCA Python Mini Project Setup" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check Python version
try {
    $pythonVersion = python --version
    Write-Host "[OK] Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python 3 was not detected in your PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# 2. Virtual Environment Setup
if (-not (Test-Path "venv")) {
    Write-Host "[1/4] Creating Python virtual environment (venv)..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "[2/4] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# 3. Dependency Installation
Write-Host "[3/4] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

# 4. Database Setup Instructions
Write-Host ""
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Database Setup Note:" -ForegroundColor White
Write-Host "1. Ensure MySQL Server 8.x service is running." -ForegroundColor White
Write-Host "2. Import the schema and sample data:" -ForegroundColor White
Write-Host "   mysql -u root -p < database.sql" -ForegroundColor Yellow
Write-Host "3. Update config.py with your MySQL root password if different." -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor Cyan
Write-Host ""

# 5. Run Flask Web Application
Write-Host "[4/4] Starting MediStock Flask Web Application on http://127.0.0.1:5000 ..." -ForegroundColor Green
Write-Host "Default Login Credentials: Username = admin | Password = admin123" -ForegroundColor White
python app.py
