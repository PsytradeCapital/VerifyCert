@echo off
echo Starting development server with memory optimization...
cd frontend
set NODE_OPTIONS=--max-old-space-size=4096
npm start
pause