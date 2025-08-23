const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix malformed interfaces
    const malformedInterfaceRegex = /interface\s+(\w+)\s*\{\s*\}\s*\}\s*([^}]+)/g;
    content = content.replace(malformedInterfaceRegex, (match, name, props) => {
      modified = true;
      return `interface ${name} {\n${props.trim()}\n}`;
    });

    // Remove excessive closing braces at end
    if (/(\}\s*){3,}$/.test(content)) {
      content = content.replace(/(\}\s*){3,}$/, '}');
      modified = true;
    }

    // Fix double closing braces in function parameters
    content = content.replace(/\}\}\)\s*=>/g, '}) =>');

    // Balance braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      content = content + '\n' + '}'.repeat(missing);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${path.basename(filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Critical files to fix first
const criticalFiles = [
  'frontend/src/App.tsx',
  'frontend/src/components/ErrorBoundary.tsx',
  'frontend/src/components/Navigation.tsx',
  'frontend/src/contexts/AuthContext.tsx',
  'frontend/src/pages/Home.tsx',
  'frontend/src/pages/IssuerDashboard.tsx'
];

console.log('Fixing critical syntax errors...');

let fixedCount = 0;
for (const file of criticalFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} critical files.`);

// Test build
const { execSync } = require('child_process');
try {
  console.log('Testing build...');
  const result = execSync('cd frontend && npm run build 2>&1', { 
    encoding: 'utf8', 
    timeout: 60000 
  });
  
  if (result.includes('Compiled successfully')) {
    console.log('🎉 BUILD SUCCESSFUL!');
  } else {
    console.log('Build output:', result.substring(0, 500));
  }
} catch (error) {
  console.log('Build failed:', error.stdout?.substring(0, 500) || error.message);
}