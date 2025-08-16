@echo off
echo.
echo ========================================
echo  Blog Subscription Site Setup
echo ========================================
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH
    echo.
    echo Please install MySQL first:
    echo 1. Download from https://dev.mysql.com/downloads/installer/
    echo 2. Or install XAMPP from https://www.apachefriends.org/
    echo 3. Or see MYSQL_SETUP.md for detailed instructions
    echo.
    pause
    exit /b 1
)

echo ✅ MySQL is available
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo.
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo.
)

echo Initializing database...
cd backend
npm run init-db
if %errorlevel% neq 0 (
    echo.
    echo ❌ Database initialization failed
    echo Please check your MySQL connection and credentials in backend\.env
    echo.
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Database initialized successfully!
echo.
echo Starting servers...
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Default admin credentials:
echo Email: admin@blogsite.com
echo Password: admin123
echo.

REM Start backend server in background
start "Backend Server" cmd /c "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 >nul

REM Start frontend server
start "Frontend Server" cmd /c "cd frontend && npm start"

echo.
echo ✅ Both servers are starting...
echo Check the opened terminal windows for server status
echo.
pause
