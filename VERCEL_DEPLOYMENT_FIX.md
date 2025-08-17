# Vercel Deployment Fix for VerifyCert

## Issue
Vercel deployment failing with "react-scripts: command not found" error because the project structure has frontend in a subdirectory.

## Solution Applied

### 1. Updated Root package.json
Added proper build scripts that navigate to frontend directory:
```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd frontend && npm start",
    "install": "npm install && cd frontend && npm install && cd ../backend && npm install"
  }
}
```

### 2. Created vercel.json Configuration
```json
{
  "version": 2,
  "name": "verifycert",
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "npm install",
  "framework": null,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Deployment Steps

### Option 1: Re-deploy with Fixed Configuration
1. Commit the changes to your repository:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push origin main
   ```

2. In Vercel dashboard:
   - Go to your project settings
   - Under "Build & Output Settings":
     - Framework Preset: Other
     - Build Command: `npm run build`
     - Output Directory: `frontend/build`
     - Install Command: `npm install`

3. Trigger a new deployment

### Option 2: Deploy Frontend Only
If you want to deploy just the frontend (recommended for static hosting):

1. Create a new Vercel project
2. Import only the `frontend` directory
3. Set Framework Preset to "Create React App"
4. Build Command: `npm run build`
5. Output Directory: `build`

### Option 3: Manual Build Test
Test the build locally first:
```bash
# From project root
npm run build

# Check if frontend/build directory is created
ls frontend/build
```

## Environment Variables
Make sure to set these in Vercel dashboard:
- `REACT_APP_API_URL` (if needed)
- `REACT_APP_CONTRACT_ADDRESS` (if needed)
- Any other environment variables your frontend needs

## Alternative: Deploy Frontend Separately
Since VerifyCert has a separate frontend and backend, consider:
1. Deploy frontend to Vercel (static hosting)
2. Deploy backend to Railway, Render, or Heroku
3. Update frontend API URLs to point to deployed backend

## Troubleshooting

### If build still fails:
1. Check Node.js version compatibility
2. Clear Vercel build cache
3. Ensure all dependencies are in package.json
4. Test build locally first

### Common Issues:
- **Node version**: Ensure using Node 18.x
- **Dependencies**: Make sure react-scripts is in frontend/package.json
- **Build path**: Verify output directory is correct
- **Environment**: Check all required env vars are set

## Success Indicators
✅ Build completes without errors
✅ frontend/build directory contains built files
✅ Static files are served correctly
✅ React app loads in browser
✅ All routes work properly

## Next Steps After Successful Deployment
1. Test all functionality in production
2. Update any hardcoded localhost URLs
3. Configure custom domain if needed
4. Set up monitoring and analytics
5. Update documentation with live URLs