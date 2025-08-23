#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing homepage content...');

// Check if the Home.tsx file has the correct content
const homePath = path.join(process.cwd(), 'frontend', 'src', 'pages', 'Home.tsx');

if (fs.existsSync(homePath)) {
  const content = fs.readFileSync(homePath, 'utf8');
  
  console.log('📄 Home.tsx file found');
  
  // Check for key features of the updated homepage
  const checks = [
    { name: 'Gradient background', pattern: 'bg-gradient-to-br' },
    { name: 'Interactive buttons', pattern: 'Issue Certificates' },
    { name: 'Features section', pattern: 'Features' },
    { name: 'Stats section', pattern: '100%' },
    { name: 'How it works', pattern: 'How It Works' },
    { name: 'Animations', pattern: 'transition-all' },
    { name: 'Hero section', pattern: 'Hero Section' }
  ];
  
  let passedChecks = 0;
  
  checks.forEach(check => {
    if (content.includes(check.pattern)) {
      console.log(`✅ ${check.name}: Found`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.name}: Missing`);
    }
  });
  
  console.log('');
  console.log(`📊 Results: ${passedChecks}/${checks.length} checks passed`);
  
  if (passedChecks === checks.length) {
    console.log('🎉 Homepage content is correct!');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Wait for the build to complete');
    console.log('2. Start your dev server: cd frontend && npm start');
    console.log('3. Open in incognito mode: http://localhost:3000');
    console.log('4. You should see the beautiful new homepage!');
  } else {
    console.log('⚠️ Some content is missing. The homepage may not display correctly.');
  }
  
} else {
  console.log('❌ Home.tsx file not found');
}

// Check build directory
const buildDir = path.join(process.cwd(), 'frontend', 'build');
if (fs.existsSync(buildDir)) {
  console.log('📁 Build directory exists');
  
  const indexPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('📄 index.html found in build');
  } else {
    console.log('❌ index.html not found in build');
  }
} else {
  console.log('⏳ Build directory not ready yet (build in progress)');
}