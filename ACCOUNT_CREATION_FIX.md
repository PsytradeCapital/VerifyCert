# Account Creation Fix Guide

## 🔍 **Diagnosis: "Failed to Fetch Data" Error**

The account creation is failing because of several potential issues. Here's how to fix them:

## 🚀 **Quick Fix Steps**

### 1. **Ensure Backend is Running on Correct Port**
```bash
# Check if backend is running on port 4000
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 4000
📱 Environment: development
🌐 Frontend URL: http://localhost:3000
Connected to SQLite database
```

### 2. **Test Backend API Directly**
```bash
# Test if the backend is responding
curl http://localhost:4000/health

# Test registration endpoint
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "region": "US"
  }'
```

### 3. **Check Database Directory**
```bash
# Create data directory if it doesn't exist
mkdir -p backend/data

# Check if database file exists
ls -la backend/data/
```

### 4. **Fix CORS Issues**
The backend config shows `PORT=4000` but the default config uses `3001`. Let's fix this:

```bash
# Edit backend/src/config/index.js
# Change line: port: process.env.PORT || 3001,
# To: port: process.env.PORT || 4000,
```

## 🔧 **Complete Fix Implementation**

### Fix 1: Update Backend Config
```javascript
// backend/src/config/index.js
const config = {
  // Server configuration
  port: process.env.PORT || 4000, // Changed from 3001 to 4000
  nodeEnv: process.env.NODE_ENV || 'development',
  // ... rest of config
};
```

### Fix 2: Ensure Database Directory Exists
```bash
# From project root
mkdir -p backend/data
chmod 755 backend/data
```

### Fix 3: Add Error Handling to Auth Service
The frontend auth service needs better error handling for network issues.

### Fix 4: Check Network Connectivity
```bash
# Test if frontend can reach backend
# From frontend directory
curl -v http://localhost:4000/health
```

## 🐛 **Common Issues & Solutions**

### Issue 1: "Failed to fetch"
**Cause**: Backend not running or wrong port
**Solution**: 
```bash
cd backend
npm run dev
# Ensure you see "Server running on port 4000"
```

### Issue 2: "CORS Error"
**Cause**: CORS misconfiguration
**Solution**: Backend .env should have:
```
FRONTEND_URL=http://localhost:3000
```

### Issue 3: "Database Error"
**Cause**: Database directory doesn't exist
**Solution**:
```bash
mkdir -p backend/data
```

### Issue 4: "Network Error"
**Cause**: Frontend trying wrong port
**Solution**: Frontend .env should have:
```
REACT_APP_API_URL=http://localhost:4000
```

## ✅ **Verification Steps**

1. **Backend Health Check**:
   ```bash
   curl http://localhost:4000/health
   ```
   Should return: `{"success":true,"message":"Server is healthy",...}`

2. **Frontend API Connection**:
   - Open browser dev tools (F12)
   - Go to Network tab
   - Try to create account
   - Check if request goes to `http://localhost:4000/api/auth/register`

3. **Database Connection**:
   ```bash
   ls -la backend/data/verifycert.db
   ```
   Should show the database file exists

## 🚨 **Emergency Reset**

If nothing works, try this complete reset:

```bash
# Stop all servers (Ctrl+C)

# Clear all caches
npm cache clean --force

# Recreate database directory
rm -rf backend/data
mkdir -p backend/data

# Restart backend
cd backend
npm run dev

# In new terminal, restart frontend
cd frontend
npm start
```

## 📋 **Expected Behavior After Fix**

1. **Registration Form**: Should submit without "Failed to fetch" error
2. **Success Response**: Should show "Registration successful" message
3. **OTP Screen**: Should redirect to OTP verification
4. **Database**: Should create user record in SQLite database

Try these fixes in order and let me know which step resolves the issue!