# Clear Cache Commands

## 🧹 Terminal Commands to Clear Cache

### 1. **Clear npm cache**
```bash
npm cache clean --force
```

### 2. **Clear React build cache**
```bash
# Navigate to frontend directory
cd frontend

# Remove build cache
rm -rf build
rm -rf node_modules/.cache
rm -rf .eslintcache

# For Windows (if rm doesn't work):
rmdir /s build
rmdir /s node_modules\.cache
del .eslintcache
```

### 3. **Clear all node_modules and reinstall**
```bash
# From root directory
rm -rf node_modules
rm -rf frontend/node_modules
rm -rf backend/node_modules

# For Windows:
rmdir /s node_modules
rmdir /s frontend\node_modules
rmdir /s backend\node_modules

# Reinstall everything
npm run install:all
```

### 4. **Force rebuild frontend**
```bash
cd frontend
npm run build
npm start
```

### 5. **Complete cache clear and restart**
```bash
# Stop all running servers (Ctrl+C)

# Clear all caches
npm cache clean --force
cd frontend
rm -rf build node_modules/.cache .eslintcache
cd ..

# Restart everything
npm run dev:all
```

## 🚀 **RECOMMENDED QUICK FIX:**

```bash
# 1. Stop the frontend server (Ctrl+C)

# 2. Clear frontend cache
cd frontend
rm -rf build
rm -rf node_modules/.cache
rm -rf .eslintcache

# 3. Restart frontend
npm start
```

## 🌐 **Browser Cache Clear (Alternative)**

If terminal cache clearing doesn't work, use browser:

### Chrome/Edge:
- Press `Ctrl + Shift + R` (Hard refresh)
- Or `F12` → Right-click refresh → "Empty Cache and Hard Reload"

### Firefox:
- Press `Ctrl + F5`
- Or `Ctrl + Shift + R`

### Incognito Mode:
- Open `Ctrl + Shift + N` (Chrome) or `Ctrl + Shift + P` (Firefox)
- Navigate to `http://localhost:3000`

## ✅ **What You Should See After Cache Clear:**

1. **✅ Wallet Connect Button** - Blue button in top navigation
2. **✅ Theme Toggle** - Sun/Moon icon working
3. **✅ Sign In/Sign Up** - Buttons with proper icons
4. **✅ Small Feedback Button** - 40x40px in bottom-right corner
5. **✅ Original Colors** - Your beautiful original design preserved