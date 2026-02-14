@echo off

set "PORT=4000"

echo [INFO] Searching for process on port %PORT%...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr "LISTENING"') do (
    echo [INFO] Killing PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    echo [OK] Server stopped.
) else (
    echo [WARN] Server may still be running.
)

timeout /t 2 /nobreak >nul
