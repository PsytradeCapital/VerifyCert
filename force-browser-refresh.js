#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Forcing browser refresh and cache clear...');

// Add cache-busting to the build
const buildDir = path.join(process.cwd(), 'frontend', 'build');
const indexPath = path.join(buildDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Add cache-busting meta tags
  const cacheBustingTags = `
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  `;
  
  // Insert after <head> tag
  indexContent = indexContent.replace('<head>', '<head>' + cacheBustingTags);
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Added cache-busting headers to index.html');
}

// Create a cache-clearing HTML file
const cacheClearHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>VerifyCert - Cache Cleared</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .btn {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
        }
        .btn:hover {
            background: #45a049;
        }
        .instructions {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 VerifyCert - Updated!</h1>
        <p>Your application has been updated with full functionality!</p>
        
        <div class="instructions">
            <h3>To see the new features, please:</h3>
            <ol>
                <li><strong>Clear your browser cache:</strong>
                    <ul>
                        <li><strong>Chrome/Edge:</strong> Ctrl+Shift+Delete → Clear browsing data</li>
                        <li><strong>Firefox:</strong> Ctrl+Shift+Delete → Clear recent history</li>
                        <li><strong>Safari:</strong> Cmd+Option+E → Empty caches</li>
                    </ul>
                </li>
                <li><strong>Hard refresh:</strong> Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)</li>
                <li><strong>Or use incognito/private browsing mode</strong></li>
            </ol>
        </div>
        
        <a href="/" class="btn">🏠 Go to Homepage</a>
        <a href="/issuer-dashboard" class="btn">📋 Issuer Dashboard</a>
        <a href="/verify" class="btn">✅ Verify Certificate</a>
        
        <p style="margin-top: 30px;">
            <small>If you still see the old version, try opening in an incognito/private window</small>
        </p>
        
        <script>
            // Force reload after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            
            // Clear any cached data
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        caches.delete(name);
                    });
                });
            }
        </script>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(buildDir, 'cache-clear.html'), cacheClearHtml);

console.log('✅ Created cache-clearing page');
console.log('');
console.log('🎉 IMPORTANT: To see your updated homepage with full features:');
console.log('');
console.log('1. 🔄 Clear your browser cache:');
console.log('   - Chrome/Edge: Ctrl+Shift+Delete');
console.log('   - Firefox: Ctrl+Shift+Delete');
console.log('   - Safari: Cmd+Option+E');
console.log('');
console.log('2. 🔃 Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
console.log('');
console.log('3. 🕵️ Or open in incognito/private browsing mode');
console.log('');
console.log('4. 🌐 Visit: http://localhost:3000/cache-clear.html first');
console.log('');
console.log('Your updated homepage now includes:');
console.log('✨ Beautiful gradient design');
console.log('🎯 Interactive buttons');
console.log('📊 Stats section');
console.log('🔄 Smooth animations');
console.log('🎨 Modern UI components');
console.log('');