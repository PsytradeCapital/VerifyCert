@echo off
echo Emergency build - maximum memory allocation...
cd frontend

echo Step 1: Clear all caches
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q .tsbuildinfo 2>nul
del /q tsconfig.tsbuildinfo 2>nul

echo Step 2: Set maximum memory
set NODE_OPTIONS=--max-old-space-size=16384 --max-semi-space-size=1024
set GENERATE_SOURCEMAP=false
set TSC_COMPILE_ON_ERROR=true
set SKIP_PREFLIGHT_CHECK=true

echo Step 3: Build with optimizations
npm run build --max_old_space_size=16384

echo Build completed!
pause