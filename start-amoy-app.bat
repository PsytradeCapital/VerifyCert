@echo off
echo 🚀 Starting VerifyCert on Amoy Network...
echo ============================================================

echo 🔧 Starting Backend Server (Port 3003)...
start "VerifyCert Backend" cmd /k "cd backend && npm run dev"

echo ⏳ Waiting for backend to initialize...
timeout /t 10 /nobreak > nul

echo 🎨 Starting Frontend Server (Port 3000)...
start "VerifyCert Frontend" cmd /k "cd frontend && npm start"

echo ============================================================
echo 🎉 VerifyCert servers are starting!
echo ============================================================
echo 🔧 Backend API: http://localhost:3003
echo 🎨 Frontend App: http://localhost:3000
echo 🌐 Network: Polygon Amoy Testnet
echo 📍 Contract: 0x6c9D554C721dA0CEA1b975982eAEe1f924271F50
echo 💰 Faucet: https://faucet.polygon.technology/
echo ============================================================
echo.
echo ✨ VerifyCert is ready to use on Amoy network!
echo Press any key to continue...
pause > nul