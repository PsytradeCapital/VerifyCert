const fs = require('fs');

console.log('🔧 Fixing critical TypeScript syntax errors...');

// Fix monitoredFetch.ts - remove extra closing braces
const monitoredFetchPath = 'frontend/src/utils/monitoredFetch.ts';
if (fs.existsSync(monitoredFetchPath)) {
  let content = fs.readFileSync(monitoredFetchPath, 'utf8');
  
  // Remove any trailing extra braces at the end
  content = content.replace(/\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*\n\}\s*$/g, '');
  content = content.replace(/\n\}\s*$/g, '');
  
  // Ensure proper ending
  if (!content.endsWith('export default monitoredFetch;')) {
    content = content.replace(/export default monitoredFetch;.*$/s, 'export default monitoredFetch;');
  }
  
  fs.writeFileSync(monitoredFetchPath, content);
  console.log('✅ Fixed monitoredFetch.ts');
}

// Fix optimizedImports.ts - remove extra closing braces
const optimizedImportsPath = 'frontend/src/utils/optimizedImports.ts';
if (fs.existsSync(optimizedImportsPath)) {
  let content = fs.readFileSync(optimizedImportsPath, 'utf8');
  
  // Remove any trailing extra braces
  content = content.replace(/\n\}\s*\n\}\s*\n\}\s*$/g, '');
  content = content.replace(/\n\}\s*$/g, '');
  
  // Ensure it ends properly
  if (!content.trim().endsWith('}')) {
    content = content.trim();
  }
  
  fs.writeFileSync(optimizedImportsPath, content);
  console.log('✅ Fixed optimizedImports.ts');
}

// Fix performanceMonitoring.ts - remove extra closing brace
const performanceMonitoringPath = 'frontend/src/utils/performanceMonitoring.ts';
if (fs.existsSync(performanceMonitoringPath)) {
  let content = fs.readFileSync(performanceMonitoringPath, 'utf8');
  
  // Remove any trailing extra braces
  content = content.replace(/\n\}\s*\n\}\s*$/g, '');
  
  // Ensure proper ending
  if (!content.trim().endsWith('}')) {
    content = content.trim();
  }
  
  fs.writeFileSync(performanceMonitoringPath, content);
  console.log('✅ Fixed performanceMonitoring.ts');
}

// Fix performanceSetup.ts - fix malformed function signatures
const performanceSetupPath = 'frontend/src/utils/performanceSetup.ts';
if (fs.existsSync(performanceSetupPath)) {
  let content = fs.readFileSync(performanceSetupPath, 'utf8');
  
  // Fix any malformed template literals in the content
  content = content.replace(/\\\`/g, '`');
  content = content.replace(/\\\$/g, '$');
  
  fs.writeFileSync(performanceSetupPath, content);
  console.log('✅ Fixed performanceSetup.ts');
}

console.log('\n🎯 Critical syntax fixes completed!');
console.log('\nTesting compilation...');

// Test TypeScript compilation
const { exec } = require('child_process');
exec('cd frontend && npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ TypeScript compilation still has errors:');
    console.log(stderr || stdout);
  } else {
    console.log('✅ TypeScript compilation successful!');
    console.log('\nNow try running: cd frontend && npm run build');
  }
});