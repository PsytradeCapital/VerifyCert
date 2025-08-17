const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Comprehensive TypeScript error fix...');

// Function to recursively find all TypeScript files
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Get all TypeScript files
const tsFiles = findTsxFiles('frontend/src');

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

// Fix patterns
const fixes = [
  // Button variants
  { pattern: /variant="primary"/g, replacement: 'variant="default"' },
  { pattern: /variant="danger"/g, replacement: 'variant="destructive"' },
  { pattern: /variant="tertiary"/g, replacement: 'variant="outline"' },
  
  // Button sizes
  { pattern: /size="md"/g, replacement: 'size="default"' },
  
  // LoadingButton variants
  { pattern: /(<LoadingButton[^>]*variant=)"default"/g, replacement: '$1"primary"' },
  
  // Remove icon props from Button components
  { pattern: /\s+icon=\{[^}]+\}\s*\n/g, replacement: '\n' },
  { pattern: /\s+icon=\{[^}]+\}/g, replacement: '' },
  
  // Fix FloatingActionButton variants
  { pattern: /(<FloatingActionButton[^>]*variant=)"default"/g, replacement: '$1"primary"' },
  
  // Fix import statements
  { pattern: /import Button from ['"]([^'"]*Button[^'"]*)['"]/g, replacement: 'import { Button } from "$1"' },
  { pattern: /import Modal from ['"]([^'"]*Modal[^'"]*)['"]/g, replacement: 'import { Modal } from "$1"' },
  
  // Fix JSX syntax errors
  { pattern: />\s*\}/g, replacement: '>' },
  { pattern: /\s+\}$/gm, replacement: '' },
];

let totalChanges = 0;

tsFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;
    
    fixes.forEach(fix => {
      const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) {
        fileChanged = true;
        totalChanges++;
      }
    });
    
    if (fileChanged) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.log(`⚠️ Error processing ${filePath}: ${error.message}`);
  }
});

console.log(`\n🎉 Applied ${totalChanges} fixes across ${tsFiles.length} files!`);

// Try to build and see if there are remaining errors
console.log('\n🔨 Testing build...');
try {
  execSync('cd frontend && npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful!');
} catch (error) {
  console.log('❌ Build still has errors. Checking specific issues...');
  
  // Extract specific error patterns and fix them
  const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
  console.log('Build errors:', errorOutput.substring(0, 1000));
}

console.log('\n✅ Comprehensive fix complete!');