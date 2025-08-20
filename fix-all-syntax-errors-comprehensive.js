const fs = require('fs');
const path = require('path');

// Comprehensive syntax error fixer
class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
  }

  // Fix incomplete import/export statements
  fixIncompleteStatements(content) {
    // Fix incomplete imports
    content = content.replace(/^import\s*$/gm, '');
    content = content.replace(/^import\s+[^;]*$/gm, (match) => {
      if (!match.includes('from') && !match.includes('{')) {
        return '';
      }
      if (!match.endsWith(';')) {
        return match + ';';
      }
      return match;
    });

    // Fix incomplete exports
    content = content.replace(/^export\s*$/gm, '');
    content = content.replace(/^export\s+[^;{]*$/gm, (match) => {
      if (match.includes('function') || match.includes('const') || match.includes('class')) {
        return match;
      }
      if (!match.endsWith(';') && !match.includes('{')) {
        return match + ';';
      }
      return match;
    });

    return content;
  }

  // Balance braces by counting and adding missing ones
  balanceBraces(content) {
    const lines = content.split('\n');
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    
    for (const line of lines) {
      // Count braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
      }
    }

    // Add missing closing braces
    let additions = '';
    if (braceCount > 0) {
      additions += '\n' + '}'.repeat(braceCount);
    }
    if (parenCount > 0) {
      additions += ')'.repeat(parenCount);
    }
    if (bracketCount > 0) {
      additions += ']'.repeat(bracketCount);
    }

    return content + additions;
  }

  // Fix specific TypeScript/React issues
  fixTypeScriptIssues(content, filePath) {
    // Add React import if JSX is used but React not imported
    if (content.includes('<') && content.includes('>') && !content.includes('import React')) {
      content = "import React from 'react';\n" + content;
    }

    // Fix function return types
    if (filePath.endsWith('.tsx')) {
      content = content.replace(/export\s+default\s+function\s+(\w+)\s*\([^)]*\)\s*{/g, 
        'export default function $1(): JSX.Element {');
    }

    return content;
  }

  // Main fix function for a single file
  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Apply fixes
      content = this.fixIncompleteStatements(content);
      content = this.balanceBraces(content);
      content = this.fixTypeScriptIssues(content, filePath);

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fixedFiles.push(filePath);
        console.log(`Fixed: ${filePath}`);
      }

      return true;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  // Get all TypeScript/JavaScript files recursively
  getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Fix all files in the frontend directory
  fixAllFiles() {
    console.log('Starting comprehensive syntax error fix...');
    
    const frontendDir = path.join(process.cwd(), 'frontend', 'src');
    const files = this.getAllFiles(frontendDir);
    
    console.log(`Found ${files.length} files to check`);
    
    for (const file of files) {
      this.fixFile(file);
    }

    console.log(`\nFixed ${this.fixedFiles.length} files`);
    if (this.errors.length > 0) {
      console.log(`Errors in ${this.errors.length} files:`);
      this.errors.forEach(err => console.log(`  ${err.file}: ${err.error}`));
    }
  }
}

// Run the fixer
const fixer = new SyntaxErrorFixer();
fixer.fixAllFiles();

console.log('\nSyntax error fix complete!');