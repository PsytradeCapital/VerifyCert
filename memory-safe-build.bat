@echo off
echo Starting memory-safe build...
cd frontend
set NODE_OPTIONS=--max-old-space-size=8192
npm run build
pause