@echo off
echo 🚀 Starting VerifyCert Application...
echo ============================================================

echo 🔧 Starting Backend Server...
start "VerifyCert Backend" cmd /k "node backend/src/server.js"

echo ⏳ Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend Server...
start "VerifyCert Frontend" cmd /k "cd frontend && npm start"

echo ============================================================
echo 🎉 VerifyCert is starting!
echo ============================================================
echo 🔧 Backend: http://localhost:4000
echo 🎨 Frontend: http://localhost:3000 (will open automatically)
echo 🌐 Network: Polygon Amoy Testnet
echo 📍 Contract: 0x6c9D554C721dA0CEA1b975982eAEe1f924271F50
echo ============================================================
echo.
echo ✨ Both servers are starting in separate windows!
echo Close this window or press any key to continue...
pause > nul