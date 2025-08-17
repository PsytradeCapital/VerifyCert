const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Button icon props...');

// Files to fix
const filesToFix = [
  'frontend/src/components/ui/Settings/SettingsPanel.tsx',
  'frontend/src/components/ui/Certificate/CertificateActions.tsx'
];

// Function to remove icon props from Button components
function fixButtonIcons(content) {
  // Remove icon props from Button components
  return content.replace(
    /(\s+)icon=\{[^}]+\}\s*\n/g,
    ''
  );
}

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixButtonIcons(content);
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log('✅ Button icon fixes complete!');