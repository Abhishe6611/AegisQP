@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     AEGIS QP - Project Setup ^& Initialization
echo ===================================================
echo.

:: 1. Backend Requirements
echo [*] Installing Backend Dependencies...
cd backend
if not exist "venv" (
    echo [!] Creating Python Virtual Environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b %errorlevel%
)
echo [OK] Backend dependencies installed.
echo.

:: 2. AI Service Requirements
echo [*] Installing AI Service Dependencies...
cd ..\ai-service
pip install -r requirements.txt
python -m bloom_ai.py
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install AI service requirements.
    pause
    exit /b %errorlevel%
)
echo [OK] AI service dependencies installed.
echo.

:: 3. Frontend Packages
echo [*] Installing Frontend Dependencies (NPM)...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend packages.
    pause
    exit /b %errorlevel%
)
echo [OK] Frontend dependencies installed.
echo.

:: 4. Check PostgreSQL and Seed Data
echo [*] Checking if PostgreSQL is online...
cd ..\backend
call venv\Scripts\activate.bat

:: Create a temporary python script to test DB connection
echo import sys > test_db.py
echo from sqlalchemy import create_engine >> test_db.py
echo from app.core.config import settings >> test_db.py
echo try: >> test_db.py
echo     engine = create_engine(settings.DATABASE_URL) >> test_db.py
echo     conn = engine.connect() >> test_db.py
echo     conn.close() >> test_db.py
echo     sys.exit(0) >> test_db.py
echo except Exception as e: >> test_db.py
echo     sys.exit(1) >> test_db.py

python test_db.py >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is ONLINE and reachable.
    echo [*] Running database migrations...
    call alembic upgrade head
    
    echo [*] Seeding initial database data...
    python seed.py
    echo [OK] Database seeded successfully!
) else (
    echo [WARNING] PostgreSQL is OFFLINE or unreachable.
    echo [WARNING] Skipping database migrations and seeding.
    echo [!] Please ensure PostgreSQL is running and DATABASE_URL in backend/.env is correct.
)

del test_db.py
echo.
echo ===================================================
echo     Setup Complete! You can now run the project.
echo ===================================================
pause
