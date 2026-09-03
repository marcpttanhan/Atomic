@echo off
setlocal
cd /d "%~dp0"

if not exist "dist\index.html" (
    echo dist\index.html not found - building the project first...
    call npm run build
    if errorlevel 1 (
        echo.
        echo Build failed. Press any key to exit.
        pause >nul
        exit /b 1
    )
)

echo Starting local server on http://localhost:3000 ...
start "Atomic Recall - dist server" cmd /k npx serve dist -l 3000

echo Waiting for the server to boot...
ping -n 3 127.0.0.1 >nul

echo Opening http://localhost:3000 in your default browser...
start "" http://localhost:3000

echo.
echo Done. The server is running in the other window - close that window to stop it.
