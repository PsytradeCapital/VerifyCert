@echo off
echo 🚨 NUCLEAR CACHE CLEAR - FORCING LATEST CHANGES
echo.

echo 🛑 Step 1: Stopping all servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo 🧹 Step 2: Clearing all caches...
cd frontend
if exist build rmdir /s /q build
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .next rmdir /s /q .next
if exist dist rmdir /s /q dist
if exist .eslintcache del .eslintcache
npm cache clean --force

echo 🔨 Step 3: Force rebuilding...
npm run build

echo 🚀 Step 4: Starting with production build...
echo.
echo ✅ Now open your browser and go to: http://localhost:3000
echo ✅ Use Ctrl+Shift+R to hard refresh
echo ✅ Or use Incognito mode: Ctrl+Shift+N
echo.
npx serve -s build -l 3000