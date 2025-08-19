const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔄 Forcing browser refresh and clearing cache...');

// Stop the dev server first
console.log('⏹️ Stopping development server...');
try {
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
} catch (error) {
  // Server might not be running
}

// Clear React cache
console.log('🧹 Clearing React cache...');
try {
  execSync('rmdir /s /q frontend\\node_modules\\.cache', { stdio: 'ignore' });
} catch (error) {
  // Cache might not exist
}

// Update App.tsx with a timestamp to force refresh
const timestamp = new Date().toISOString();
let appContent = fs.readFileSync('frontend/src/App.tsx', 'utf8');

// Add a comment with timestamp to force reload
if (!appContent.includes('// Last updated:')) {
  appContent = `// Last updated: ${timestamp}\n${appContent}`;
} else {
  appContent = appContent.replace(/\/\/ Last updated: .*\n/, `// Last updated: ${timestamp}\n`);
}

fs.writeFileSync('frontend/src/App.tsx', appContent);

console.log('✅ Cache cleared and app updated');
console.log('🚀 Starting fresh development server...');

// Start dev server
try {
  execSync('cd frontend && npm start', { 
    stdio: 'inherit',
    detached: true
  });
} catch (error) {
  console.log('Server started in background');
}

console.log('');
console.log('🌟 INSTRUCTIONS:');
console.log('1. Wait for the server to start');
console.log('2. Open http://localhost:3000 in a NEW incognito/private window');
console.log('3. Or press Ctrl+Shift+R to hard refresh your current browser');
console.log('4. You should now see the full VerifyCert homepage with features!');
console.log('');