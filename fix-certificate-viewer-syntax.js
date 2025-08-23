const fs = require('fs');
const path = require('path');

console.log('🔍 Fixing CertificateViewer.tsx syntax error...');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'CertificateViewer.tsx');

try {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📄 File read successfully');
  
  // Split into lines to analyze
  const lines = content.split('\n');
  
  // Find the problematic area around line 19
  console.log('\n🔍 Lines around the error:');
  for (let i = 15; i < 25 && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
  
  // Look for the specific pattern that's causing issues
  const problematicPatterns = [
    /}}\s*\|\s*null;/g,  // }} | null;
    /}\s*}\s*\|\s*null;/g,  // } } | null;
    /blockNumber\?\:\s*string;\s*contractAddress\?\:\s*string;\s*}}\s*\|\s*null;/g
  ];
  
  let fixed = false;
  
  // Try to fix common patterns
  problematicPatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      console.log(`\n✅ Found problematic pattern ${index + 1}`);
      
      if (index === 0) {
        // Fix }} | null; to } | null;
        content = content.replace(pattern, '} | null;');
        fixed = true;
      } else if (index === 1) {
        // Fix } } | null; to } | null;
        content = content.replace(pattern, '} | null;');
        fixed = true;
      } else if (index === 2) {
        // Fix the specific blockNumber/contractAddress issue
        content = content.replace(pattern, 'blockNumber?: string;\n    contractAddress?: string;\n  } | null;');
        fixed = true;
      }
    }
  });
  
  // If no specific pattern found, try a more general approach
  if (!fixed) {
    console.log('\n🔧 Trying general fixes...');
    
    // Look for interface definitions that might be malformed
    const interfaceRegex = /interface\s+CertificateViewerState\s*{[\s\S]*?}/g;
    const match = content.match(interfaceRegex);
    
    if (match) {
      console.log('Found interface definition');
      
      // Create a clean interface definition
      const cleanInterface = `interface CertificateViewerState {
  certificate: Certificate | null;
  isLoading: boolean;
  error: string | null;
  isVerifying: boolean;
  verificationResult: {
    isValid: boolean;
    onChain: boolean;
    message: string;
    verificationTimestamp?: number;
    blockNumber?: string;
    contractAddress?: string;
  } | null;
}`;
      
      content = content.replace(interfaceRegex, cleanInterface);
      fixed = true;
    }
  }
  
  if (fixed) {
    // Write the fixed content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('\n✅ File fixed successfully!');
    
    // Verify the fix by checking for syntax errors
    console.log('\n🔍 Verifying fix...');
    const lines = content.split('\n');
    for (let i = 15; i < 25 && i < lines.length; i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  } else {
    console.log('\n❌ Could not identify the specific syntax error pattern');
    
    // Show more context
    console.log('\n📄 Full interface area:');
    const interfaceStart = content.indexOf('interface CertificateViewerState');
    if (interfaceStart !== -1) {
      const interfaceEnd = content.indexOf('}', interfaceStart + 200);
      const interfaceContent = content.substring(interfaceStart, interfaceEnd + 1);
      console.log(interfaceContent);
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}