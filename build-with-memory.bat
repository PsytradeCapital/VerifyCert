@echo off
echo Increasing Node.js memory limit for build...
cd frontend
set NODE_OPTIONS=--max-old-space-size=8192
npm run build
pause