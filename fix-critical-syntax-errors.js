const fs = require('fs');
const path = require('path');

// List of critical files that need immediate fixing
const criticalFiles = [
  'frontend/src/components/ErrorBoundary.tsx',
  'frontend/src/pages/Home.tsx',
  'frontend/src/pages/NotFound.tsx',
  'frontend/src/pages/IssuerDashboard.tsx',
  'frontend/src/pages/Settings.tsx',
  'frontend/src/App.tsx',
  'frontend/src/components/Navigation.tsx',
  'frontend/src/components/CertificateCard.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove excessive closing braces at the end
    const excessiveBracesRegex = /(\}\s*){3,}$/;
    if (excessiveBracesRegex.test(content)) {
      content = content.replace(excessiveBracesRegex, '}');
      modified = true;
      console.log(`Removed excessive closing braces from: ${filePath}`);
    }

    // Fix malformed interfaces
    content = content.replace(/interface\s+(\w+)\s*\{\s*\}\s*([^}]+)/g, (match, name, props) => {
      modified = true;
      return `interface ${name} {\n${props.trim()}\n}`;
    });

    // Count and balance braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      content = content + '\n' + '}'.repeat(missing);
      modified = true;
      console.log(`Added ${missing} missing closing braces to: ${filePath}`);
    } else if (closeBraces > openBraces) {
      // Remove excess closing braces from the end
      const excess = closeBraces - openBraces;
      const bracesAtEnd = content.match(/\}+$/);
      if (bracesAtEnd && bracesAtEnd[0].length >= excess) {
        content = content.replace(/\}+$/, '}');
        modified = true;
        console.log(`Removed ${excess} excess closing braces from: ${filePath}`);
      }
    }

    // Fix incomplete export statements
    content = content.replace(/^(\s*export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+[^;{]+)$/gm, (match) => {
      if (!match.includes('{') && !match.includes(';')) {
        modified = true;
        return match + ';';
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('Fixing critical syntax errors...\n');

let fixedCount = 0;
for (const file of criticalFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} critical files.`);
console.log('Testing build...');

// Test build
const { execSync } = require('child_process');
try {
  const result = execSync('cd frontend && npm run build 2>&1', { encoding: 'utf8', timeout: 30000 });
  if (result.includes('Compiled successfully')) {
    console.log('\n🎉 Build successful!');
  } else {
    console.log('\n⚠️ Build completed with warnings/errors:');
    console.log(result.substring(0, 1000) + '...');
  }
} catch (error) {
  console.log('\n❌ Build failed. Output:');
  console.log(error.stdout?.substring(0, 1000) + '...' || error.message);
}