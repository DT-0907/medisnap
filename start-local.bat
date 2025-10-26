@echo off
REM MedSnap Local Development Startup Script for Windows

echo.
echo 🚀 Starting MedSnap Local Development Environment...
echo.

REM Check if .env file exists
if not exist "medisnap\backend\.env" (
    echo Warning: .env file not found in medisnap\backend\
    echo Creating from .env.example...
    copy medisnap\backend\.env.example medisnap\backend\.env
    echo Please edit medisnap\backend\.env with your API keys
    echo.
)

REM Check for node_modules
if not exist "medisnap\backend\node_modules\" (
    echo Installing backend dependencies...
    cd medisnap\backend
    call npm install
    cd ..\..
    echo.
)

REM Start backend server
echo Starting backend server on http://localhost:3000...
echo Press Ctrl+C to stop
echo.

cd medisnap\backend

REM Set NODE_ENV for development
set NODE_ENV=development

REM Start the server
call npm run dev

REM After Ctrl+C
echo.
echo Backend server stopped
echo To restart: start-local.bat
pause