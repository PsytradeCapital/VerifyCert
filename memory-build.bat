@echo off
cd frontend
set NODE_OPTIONS=--max-old-space-size=8192
set GENERATE_SOURCEMAP=false
npm run build
pause