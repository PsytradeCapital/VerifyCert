const fs = require('fs');

console.log('🔧 Fixing InputDemo component...');

try {
  let content = fs.readFileSync('frontend/src/components/InputDemo.tsx', 'utf8');
  
  // Remove all unsupported props
  const unsupportedProps = [
    /variant="[^"]*"/g,
    /iconPosition="[^"]*"/g,
    /enableValidationAnimation={[^}]*}/g,
    /animationConfig=\{[^}]*\}/g,
    /size="[^"]*"/g
  ];
  
  unsupportedProps.forEach(prop => {
    content = content.replace(prop, '');
  });
  
  // Clean up extra whitespace and newlines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/\s+\n/g, '\n');
  
  fs.writeFileSync('frontend/src/components/InputDemo.tsx', content);
  
  console.log('✅ Fixed InputDemo component');
  console.log('🔨 Now try building again');
  
} catch (error) {
  console.error('❌ Failed to fix InputDemo:', error.message);
  process.exit(1);
}