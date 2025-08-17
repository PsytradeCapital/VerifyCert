const fs = require('fs');

console.log('🔧 Final TypeScript fix...');

try {
  let content = fs.readFileSync('frontend/src/components/InputDemo.tsx', 'utf8');
  
  console.log('📝 Mapping validation states correctly...');
  
  // The issue is that:
  // - emailValidation returns: 'default' | 'error' | 'success'
  // - passwordValidation returns: 'default' | 'warning' | 'success'  
  // - confirmPasswordValidation returns: 'default' | 'error' | 'success'
  // - Input component accepts: 'default' | 'error' | 'success'
  
  // Fix password validation state mapping (warning -> default for Input component)
  content = content.replace(
    /validationState=\{passwordValidation\.state === 'success' \? 'success' : 'default'\}/g,
    "validationState={passwordValidation.state === 'success' ? 'success' : 'default'}"
  );
  
  // Fix helper text to show warning messages
  content = content.replace(
    /helperText=\{passwordValidation\.state === 'warning' \|\| passwordValidation\.state === 'default' \? passwordValidation\.message : undefined\}/g,
    "helperText={passwordValidation.state !== 'success' ? passwordValidation.message : undefined}"
  );
  
  // Fix confirm password helper text
  content = content.replace(
    /helperText=\{confirmPasswordValidation\.state === 'default' \? confirmPasswordValidation\.message : undefined\}/g,
    "helperText={confirmPasswordValidation.state !== 'success' ? confirmPasswordValidation.message : undefined}"
  );
  
  // Fix email helper text
  content = content.replace(
    /helperText=\{emailValidation\.state === 'default' \? emailValidation\.message : undefined\}/g,
    "helperText={emailValidation.state !== 'success' ? emailValidation.message : undefined}"
  );
  
  fs.writeFileSync('frontend/src/components/InputDemo.tsx', content);
  
  console.log('✅ Fixed all validation state mappings');
  console.log('🔨 Ready to build');
  
} catch (error) {
  console.error('❌ Failed to fix TypeScript errors:', error.message);
  process.exit(1);
}