@echo off
chcp 65001 >nul

echo ========================================
echo    Zhu Meng AI Zhi Jiao - Start
echo ========================================
echo.

set BACKEND_DIR=%~dp0backend
set FRONTEND_DIR=%~dp0frontend

REM === Find Python 3.13 ===
set PYTHON_CMD="C:\Users\cmcm\AppData\Local\Programs\Python\Python313\python.exe"
if not exist %PYTHON_CMD% (
    set PYTHON_CMD="C:\Users\cmcm\AppData\Local\Programs\Python\Python312\python.exe"
)
if not exist %PYTHON_CMD% (
    set PYTHON_CMD=python
)

echo [1/3] Python: %PYTHON_CMD%
%PYTHON_CMD% --version

REM === Check deps ===
echo [2/3] Checking dependencies...
%PYTHON_CMD% -c "import uvicorn" 2>nul
if %errorlevel% neq 0 (
    echo   -^> Installing packages...
    %PYTHON_CMD% -m pip install -r "%BACKEND_DIR%\requirements.txt"
    if %errorlevel% neq 0 (
        echo   ! Install failed. Run manually:
        echo     pip install -r "%BACKEND_DIR%\requirements.txt"
        pause
        exit /b 1
    )
)

REM === Start services ===
echo.
echo [3/3] Starting services...

echo   -^> Starting Backend (port 8000)...
start "DreamAI-Backend" /min cmd /c ""%PYTHON_CMD%" "%BACKEND_DIR%\run.py""

echo   -^> Starting Frontend (port 5500)...
start "DreamAI-Frontend" /min cmd /c "cd /d "%FRONTEND_DIR%" && "%PYTHON_CMD%" -m http.server 5500"

echo   Waiting for services...
timeout /t 5 /nobreak >nul

REM === Open browser ===
start http://localhost:5500

echo.
echo ========================================
echo  All services started!
echo ========================================
echo    Frontend: http://localhost:5500
echo    API:      http://localhost:8000
echo    Docs:     http://localhost:8000/docs
echo.
echo    Accounts:
echo    admin:    admin@dreamai.cn / Admin123456
echo    volunteer: volunteer@dreamai.cn / Vol123456
echo    teacher:  teacher@dreamai.cn / Tea123456
echo    student:  student@dreamai.cn / Stu123456
echo ========================================
echo.
echo Press any key to stop services...
pause >nul

echo   -^> Stopping...
taskkill /fi "WINDOWTITLE eq DreamAI-Backend" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq DreamAI-Frontend" /f >nul 2>&1
echo Done.
timeout /t 2 /nobreak >nul
