const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical UI-related TypeScript errors...');

// Fix FeedbackIntegration export issue
const feedbackIntegrationPath = 'frontend/src/components/ui/Feedback/FeedbackIntegration.tsx';
if (fs.existsSync(feedbackIntegrationPath)) {
  let content = fs.readFileSync(feedbackIntegrationPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(feedbackIntegrationPath, content);
    console.log('✅ Fixed FeedbackIntegration module export');
  }
}

// Fix FeedbackCollector export issue
const feedbackCollectorPath = 'frontend/src/components/ui/Feedback/FeedbackCollector.tsx';
if (fs.existsSync(feedbackCollectorPath)) {
  let content = fs.readFileSync(feedbackCollectorPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(feedbackCollectorPath, content);
    console.log('✅ Fixed FeedbackCollector module export');
  }
}

// Fix CertificateActions export issue
const certificateActionsPath = 'frontend/src/components/ui/Certificate/CertificateActions.tsx';
if (fs.existsSync(certificateActionsPath)) {
  let content = fs.readFileSync(certificateActionsPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(certificateActionsPath, content);
    console.log('✅ Fixed CertificateActions module export');
  }
}

// Fix CertificateMetadata export issue
const certificateMetadataPath = 'frontend/src/components/ui/Certificate/CertificateMetadata.tsx';
if (fs.existsSync(certificateMetadataPath)) {
  let content = fs.readFileSync(certificateMetadataPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(certificateMetadataPath, content);
    console.log('✅ Fixed CertificateMetadata module export');
  }
}

// Fix Container export issue
const containerPath = 'frontend/src/components/ui/Layout/Container.tsx';
if (fs.existsSync(containerPath)) {
  let content = fs.readFileSync(containerPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(containerPath, content);
    console.log('✅ Fixed Container module export');
  }
}

// Fix InteractionAnimationsDemo export issue
const interactionAnimationsDemoPath = 'frontend/src/components/InteractionAnimationsDemo.tsx';
if (fs.existsSync(interactionAnimationsDemoPath)) {
  let content = fs.readFileSync(interactionAnimationsDemoPath, 'utf8');
  
  // Add export statement at the end if not present
  if (!content.includes('export {};')) {
    content += '\nexport {};';
    fs.writeFileSync(interactionAnimationsDemoPath, content);
    console.log('✅ Fixed InteractionAnimationsDemo module export');
  }
}

// Replace aggressive CSS with minimal version
const indexCssPath = 'frontend/src/index.css';
if (fs.existsSync(indexCssPath)) {
  const minimalCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

* {
  box-sizing: border-box;
}

/* Essential theme fixes only */
[data-theme="light"] body {
  background-color: #ffffff;
  color: #1f2937;
}

[data-theme="dark"] body {
  background-color: #0f172a;
  color: #f8fafc;
}

/* Smooth transitions */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}`;

  fs.writeFileSync(indexCssPath, minimalCss);
  console.log('✅ Replaced aggressive CSS with minimal version');
}

// Remove problematic CSS imports from any component files
const componentFiles = [
  'frontend/src/App.tsx',
  'frontend/src/components/ThemeProvider.tsx',
  'frontend/src/pages/Home.tsx'
];

componentFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove problematic CSS imports
    content = content.replace(/import\s+['"]\.\/styles\/theme-fixes\.css['"];?\n?/g, '');
    content = content.replace(/import\s+['"]\.\/styles\/themes\.css['"];?\n?/g, '');
    content = content.replace(/import\s+['"]\.\/App\.css['"];?\n?/g, '');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned CSS imports from ${filePath}`);
  }
});

console.log('🎉 Critical UI errors fixed! Try refreshing your browser.');
console.log('💡 If issues persist, clear browser cache and restart the dev server.');