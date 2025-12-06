@echo off
echo Starting Spanish Crossword Solver Development Environment...
echo.

REM Check if Python virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if backend dependencies are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting backend server on http://localhost:8000...
start "Backend Server" cmd /k "venv\Scripts\activate.bat && python -m uvicorn backend.api:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting frontend development server on http://localhost:5173...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit (servers will continue running)...
pause >nul

