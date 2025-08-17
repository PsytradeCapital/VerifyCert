# Quick Vercel Deployment Fix

## The Problem
Vercel can't find `react-scripts` because it's looking in the wrong directory.

## The Solution
I've created a custom build script that handles this. Here's what to do:

### 1. Commit the changes
```bash
git add .
git commit -m "Fix Vercel deployment"
git push origin main
```

### 2. Update Vercel settings
In your Vercel dashboard:
- Build Command: `node build.js`
- Output Directory: `frontend/build`
- Install Command: `npm install`

### 3. Redeploy
Click "Redeploy" in Vercel dashboard.

## Alternative: Deploy Frontend Only
Create new Vercel project:
- Root Directory: `frontend`
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

This should fix your deployment issue!