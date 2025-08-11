@echo off
echo 🌐 UNIVERSAL BROWSER & LOCALHOST TESTING
echo ==========================================
echo.

echo 🚀 Starting multiple frontend instances...
echo.

REM Start backend
echo 📡 Starting backend on port 4000...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 >nul

REM Start frontend on multiple ports
echo 🌍 Starting frontend on port 3000...
start "Frontend 3000" cmd /k "cd frontend && set PORT=3000 && npm start"
timeout /t 2 >nul

echo 🌍 Starting frontend on port 3001...
start "Frontend 3001" cmd /k "cd frontend && set PORT=3001 && npm start"
timeout /t 2 >nul

echo 🌍 Starting frontend on port 8080...
start "Frontend 8080" cmd /k "cd frontend && set PORT=8080 && npm start"
timeout /t 2 >nul

echo.
echo ✅ All servers started! Now test in ALL browsers:
echo.
echo 🔗 Chrome:
echo    http://localhost:3000
echo    http://localhost:3001  
echo    http://localhost:8080
echo    http://127.0.0.1:3000
echo.
echo 🔗 Firefox:
echo    http://localhost:3000
echo    http://localhost:3001
echo    http://localhost:8080
echo    http://127.0.0.1:3000
echo.
echo 🔗 Edge:
echo    http://localhost:3000
echo    http://localhost:3001
echo    http://localhost:8080
echo    http://127.0.0.1:3000
echo.
echo 💡 For each browser/URL combination:
echo    1. Press Ctrl+Shift+R to hard refresh
echo    2. Check all features work identically
echo    3. Verify latest updates are visible
echo.
echo 🚨 If old version still shows, use Incognito mode:
echo    Chrome: Ctrl+Shift+N
echo    Firefox: Ctrl+Shift+P
echo    Edge: Ctrl+Shift+N
echo.
pause