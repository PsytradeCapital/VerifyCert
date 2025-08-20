#!/usr/bin/env node

/**
 * Comprehensive syntax error finder for VerifyCert
 * This will systematically check all TypeScript files for syntax errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 SYSTEMATIC SYNTAX ERROR DETECTION');
console.log('=====================================');

const frontendSrc = 'frontend/src';
const errors = [];

function checkBraceBalance(content, filePath) {
  const lines = content.split('\n');
  let braceCount = 0;
  let bracketCount = 0;
  let parenCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Count braces, brackets, and parentheses
    for (let char of line) {
      switch (char) {
        case '{': braceCount++; break;
        case '}': braceCount--; break;
        case '[': bracketCount++; break;
        case ']': bracketCount--; break;
        case '(': parenCount++; break;
        case ')': parenCount--; break;
      }
    }
    
    // Check for obvious syntax issues
    if (line.includes('import') && !line.includes(';') && !line.includes('from')) {
      errors.push(`${filePath}:${lineNum} - Incomplete import statement`);
    }
    
    if (line.includes('export') && line.includes('{') && !line.includes('}') && !line.includes('from')) {
      errors.push(`${filePath}:${lineNum} - Incomplete export statement`);
    }
  }
  
  if (braceCount !== 0) {
    errors.push(`${filePath} - Unbalanced braces: ${braceCount > 0 ? 'missing' : 'extra'} ${Math.abs(braceCount)} closing brace(s)`);
  }
  
  if (bracketCount !== 0) {
    errors.push(`${filePath} - Unbalanced brackets: ${bracketCount > 0 ? 'missing' : 'extra'} ${Math.abs(bracketCount)} closing bracket(s)`);
  }
  
  if (parenCount !== 0) {
    errors.push(`${filePath} - Unbalanced parentheses: ${parenCount > 0 ? 'missing' : 'extra'} ${Math.abs(parenCount)} closing paren(s)`);
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativePath = fullPath.replace('frontend/', '');
        
        console.log(`Checking: ${relativePath}`);
        
        // Check for basic syntax issues
        checkBraceBalance(content, relativePath);
        
        // Check for incomplete statements
        if (content.includes('export {') && !content.includes('} from')) {
          const exportLines = content.split('\n').filter(line => line.includes('export {'));
          exportLines.forEach((line, index) => {
            if (!line.includes('}')) {
              errors.push(`${relativePath} - Incomplete export statement: ${line.trim()}`);
            }
          });
        }
        
        // Check for missing semicolons in imports
        const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
        importLines.forEach((line, index) => {
          if (line.includes('from') && !line.trim().endsWith(';')) {
            errors.push(`${relativePath} - Missing semicolon in import: ${line.trim()}`);
          }
        });
        
      } catch (error) {
        errors.push(`${fullPath} - Cannot read file: ${error.message}`);
      }
    }
  }
}

// Start scanning
scanDirectory(frontendSrc);

console.log('\n📊 SCAN RESULTS');
console.log('================');

if (errors.length === 0) {
  console.log('✅ No obvious syntax errors found');
} else {
  console.log(`❌ Found ${errors.length} potential issues:`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error}`);
  });
}

console.log('\n🔧 NEXT STEPS:');
console.log('1. Fix the issues listed above');
console.log('2. Run: cd frontend && npm run build');
console.log('3. Check TypeScript compiler output for specific line numbers');