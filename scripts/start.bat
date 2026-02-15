@echo off
setlocal enabledelayedexpansion

set "APP_DIR=%~dp0.."
set "PORT=4000"
set "URL=http://localhost:%PORT%"
set "LOG=%~dp0start.log"

echo [%date% %time%] Starting... > "%LOG%"

:: Node.js check
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found >> "%LOG%"
    exit /b 1
)
echo [OK] Node.js found >> "%LOG%"

cd /d "%APP_DIR%"
echo [OK] Changed to %APP_DIR% >> "%LOG%"

:: Check node_modules
if not exist "node_modules" (
    echo [INFO] Installing dependencies... >> "%LOG%"
    call npm install >> "%LOG%" 2>&1
)

:: Check if server is already running
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Server already running >> "%LOG%"
    goto :open_browser
)

:: Clean up stale lock file before starting dev server
if exist ".next\dev\lock" (
    echo [INFO] Removing stale lock file... >> "%LOG%"
    del /f ".next\dev\lock" >nul 2>&1
)

:: Start dev server in background
echo [INFO] Starting dev server... >> "%LOG%"
start "" /b cmd /c "cd /d "%APP_DIR%" && npx next dev -p %PORT% >> "%LOG%" 2>&1"

:: Wait for server to respond (max 60s)
set /a "tries=0"
:wait_loop
if !tries! geq 60 (
    echo [ERROR] Server start timeout >> "%LOG%"
    exit /b 1
)
timeout /t 1 /nobreak >nul

:: Use PowerShell to check if server is responding
powershell -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    set /a "tries+=1"
    echo [INFO] Waiting for server... (!tries!/60) >> "%LOG%"
    goto :wait_loop
)

echo [OK] Server is ready >> "%LOG%"

:open_browser
echo [OK] Opening in default browser >> "%LOG%"
start "" "%URL%"

echo [OK] Done >> "%LOG%"
