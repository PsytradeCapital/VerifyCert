const fs = require('fs');
const path = require('path');

// Function to fix common syntax errors in TypeScript/React files
function fixSyntaxErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix incomplete export statements (missing semicolons)
    const incompleteExportRegex = /^(\s*export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+[^;{]+)$/gm;
    content = content.replace(incompleteExportRegex, (match, group) => {
      if (!group.includes('{') && !group.includes(';')) {
        modified = true;
        return group + ';';
      }
      return match;
    });

    // Fix incomplete import statements
    const incompleteImportRegex = /^(\s*import\s+[^;]+)$/gm;
    content = content.replace(incompleteImportRegex, (match, group) => {
      if (!group.includes(';')) {
        modified = true;
        return group + ';';
      }
      return match;
    });

    // Fix interface declarations without closing braces
    const interfaceRegex = /^(\s*(?:export\s+)?interface\s+\w+[^{]*\{[^}]*?)$/gm;
    let interfaceMatches = [...content.matchAll(interfaceRegex)];
    for (let match of interfaceMatches) {
      const interfaceContent = match[1];
      const openBraces = (interfaceContent.match(/\{/g) || []).length;
      const closeBraces = (interfaceContent.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        const missingBraces = openBraces - closeBraces;
        content = content.replace(match[0], interfaceContent + '\n' + '}'.repeat(missingBraces));
        modified = true;
      }
    }

    // Remove excessive closing braces at end of file
    const excessiveBracesRegex = /(\}\s*){5,}$/;
    if (excessiveBracesRegex.test(content)) {
      content = content.replace(excessiveBracesRegex, '}');
      modified = true;
    }

    // Fix missing closing braces for functions
    const functionRegex = /^(\s*(?:export\s+)?(?:default\s+)?function\s+\w+[^{]*\{)/gm;
    let functionMatches = [...content.matchAll(functionRegex)];
    
    // Count braces in entire file
    const totalOpenBraces = (content.match(/\{/g) || []).length;
    const totalCloseBraces = (content.match(/\}/g) || []).length;
    
    if (totalOpenBraces > totalCloseBraces) {
      const missingBraces = totalOpenBraces - totalCloseBraces;
      content = content + '\n' + '}'.repeat(missingBraces);
      modified = true;
    }

    // Fix missing closing parentheses
    const totalOpenParens = (content.match(/\(/g) || []).length;
    const totalCloseParens = (content.match(/\)/g) || []).length;
    
    if (totalOpenParens > totalCloseParens) {
      const missingParens = totalOpenParens - totalCloseParens;
      content = content + ')'.repeat(missingParens);
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed syntax errors in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find all TypeScript/React files
function findTSFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTSFiles(fullPath, files);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
console.log('Starting comprehensive syntax error fix...');

const srcDir = path.join(__dirname, 'frontend', 'src');
const tsFiles = findTSFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

let fixedCount = 0;
for (const file of tsFiles) {
  if (fixSyntaxErrors(file)) {
    fixedCount++;
  }
}

console.log(`\nFixed syntax errors in ${fixedCount} files.`);
console.log('Running build to check for remaining errors...');

// Run build to check results
const { execSync } = require('child_process');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build successful!');
} catch (error) {
  console.log('\n❌ Build still has errors. Manual fixes may be needed.');
}