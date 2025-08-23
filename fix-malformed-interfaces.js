const fs = require('fs');
const path = require('path');

function fixMalformedInterfaces(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix the specific pattern: interface Name { } } property: type;
    const malformedInterfaceRegex = /interface\s+(\w+)\s*\{\s*\}\s*\}\s*([^}]+)/g;
    content = content.replace(malformedInterfaceRegex, (match, interfaceName, properties) => {
      modified = true;
      console.log(`Fixed malformed interface ${interfaceName} in ${filePath}`);
      return `interface ${interfaceName} {\n${properties.trim()}\n}`;
    });

    // Fix excessive closing braces at the end of files
    const excessiveBracesRegex = /(\}\s*){3,}$/;
    if (excessiveBracesRegex.test(content)) {
      content = content.replace(excessiveBracesRegex, '}');
      modified = true;
      console.log(`Removed excessive closing braces from ${filePath}`);
    }

    // Fix double closing braces in function parameters
    content = content.replace(/\}\}\)\s*=>/g, '}) =>');
    if (content !== fs.readFileSync(filePath, 'utf8')) {
      modified = true;
      console.log(`Fixed double closing braces in function parameters in ${filePath}`);
    }

    // Fix missing closing braces for functions and classes
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      const missing = openBraces - closeBraces;
      content = content + '\n' + '}'.repeat(missing);
      modified = true;
      console.log(`Added ${missing} missing closing braces to ${filePath}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findTSXFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        findTSXFiles(fullPath, files);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

console.log('Fixing malformed interfaces and syntax errors...\n');

const srcDir = path.join(__dirname, 'frontend', 'src');
const tsFiles = findTSXFiles(srcDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

let fixedCount = 0;
for (const file of tsFiles) {
  if (fixMalformedInterfaces(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files with malformed interfaces.`);

// Test build
console.log('\nTesting build...');
const { execSync } = require('child_process');
try {
  const result = execSync('cd frontend && npm run build 2>&1', { 
    encoding: 'utf8', 
    timeout: 60000,
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  });
  
  if (result.includes('Compiled successfully')) {
    console.log('\n🎉 Build successful!');
  } else if (result.includes('SyntaxError')) {
    console.log('\n❌ Still has syntax errors:');
    const syntaxErrors = result.match(/SyntaxError[^]*?(?=\n\n|\n$|$)/g);
    if (syntaxErrors) {
      syntaxErrors.slice(0, 3).forEach(error => console.log(error));
    }
  } else {
    console.log('\n⚠️ Build completed with warnings.');
  }
} catch (error) {
  console.log('\n❌ Build failed:');
  if (error.stdout) {
    const syntaxErrors = error.stdout.match(/SyntaxError[^]*?(?=\n\n|\n$|$)/g);
    if (syntaxErrors) {
      syntaxErrors.slice(0, 3).forEach(error => console.log(error));
    } else {
      console.log(error.stdout.substring(0, 1000));
    }
  } else {
    console.log(error.message);
  }
}