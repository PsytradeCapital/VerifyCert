@echo off
echo Building without TypeScript checking...
cd frontend
set NODE_OPTIONS=--max-old-space-size=8192
set TSC_COMPILE_ON_ERROR=true
set SKIP_PREFLIGHT_CHECK=true
npm run build
pause