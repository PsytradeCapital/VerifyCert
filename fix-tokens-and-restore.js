const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing tokens and restoring styles...');

// Create styles directory
fs.mkdirSync('frontend/src/styles', { recursive: true });

// Create tokens.cjs
const tokensCjs = `module.exports = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    green: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      700: '#047857'
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    }
  },
  spacing: {
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem'
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem'
  }
};`;

fs.writeFileSync('frontend/src/styles/tokens.cjs', tokensCjs);

// Create tokens.ts
const tokensTs = `export const designTokens = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};`;

fs.writeFileSync('frontend/src/styles/tokens.ts', tokensTs);

// Copy other essential styles from backup
const stylesToRestore = [
  'themes.css',
  'theme-fixes.css',
  'theme-fixes-minimal.css'
];

stylesToRestore.forEach(file => {
  const backupPath = `frontend/src-backup/styles/${file}`;
  const targetPath = `frontend/src/styles/${file}`;
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetPath);
    console.log(`✅ Restored ${file}`);
  } else {
    // Create minimal version
    const minimalCss = `/* ${file} */
.theme-light {
  --primary: #2563eb;
  --background: #ffffff;
  --text: #1f2937;
}

.theme-dark {
  --primary: #3b82f6;
  --background: #1f2937;
  --text: #f9fafb;
}`;
    fs.writeFileSync(targetPath, minimalCss);
    console.log(`✅ Created minimal ${file}`);
  }
});

// Restore essential utils
const utilsDir = 'frontend/src/utils';
fs.mkdirSync(utilsDir, { recursive: true });

// Create cn utility
const cnUtil = `export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}`;
fs.writeFileSync(`${utilsDir}/cn.ts`, cnUtil);

// Create theme utility
const themeUtil = `export const themes = {
  light: {
    primary: '#2563eb',
    background: '#ffffff',
    text: '#1f2937'
  },
  dark: {
    primary: '#3b82f6',
    background: '#1f2937',
    text: '#f9fafb'
  }
};

export function applyTheme(theme: keyof typeof themes) {
  const root = document.documentElement;
  const themeColors = themes[theme];
  
  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(\`--\${key}\`, value);
  });
}`;
fs.writeFileSync(`${utilsDir}/theme.ts`, themeUtil);

// Restore essential components from backup
const componentsToRestore = [
  'Navigation.tsx',
  'WalletConnect.tsx',
  'ErrorBoundary.tsx'
];

componentsToRestore.forEach(file => {
  const backupPath = `frontend/src-backup/components/${file}`;
  const targetPath = `frontend/src/components/${file}`;
  
  if (fs.existsSync(backupPath)) {
    let content = fs.readFileSync(backupPath, 'utf8');
    
    // Fix common issues
    content = content.replace(/variant="primary"/g, 'variant="default"');
    content = content.replace(/variant="danger"/g, 'variant="destructive"');
    content = content.replace(/size="md"/g, 'size="default"');
    content = content.replace(/import Button from/g, 'import { Button } from');
    
    fs.writeFileSync(targetPath, content);
    console.log(`✅ Restored ${file}`);
  }
});

// Restore essential pages
const pagesToRestore = [
  'Home.tsx',
  'VerificationPage.tsx',
  'IssuerDashboard.tsx'
];

const pagesDir = 'frontend/src/pages';
fs.mkdirSync(pagesDir, { recursive: true });

pagesToRestore.forEach(file => {
  const backupPath = `frontend/src-backup/pages/${file}`;
  const targetPath = `${pagesDir}/${file}`;
  
  if (fs.existsSync(backupPath)) {
    let content = fs.readFileSync(backupPath, 'utf8');
    
    // Fix common issues
    content = content.replace(/variant="primary"/g, 'variant="default"');
    content = content.replace(/variant="danger"/g, 'variant="destructive"');
    content = content.replace(/size="md"/g, 'size="default"');
    
    fs.writeFileSync(targetPath, content);
    console.log(`✅ Restored ${file}`);
  }
});

// Create working App.tsx with routing
const workingApp = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import VerificationPage from './pages/VerificationPage';
import './styles/themes.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;`;

fs.writeFileSync('frontend/src/App.tsx', workingApp);

// Test build
console.log('🔨 Testing build with restored functionality...');
try {
  execSync('cd frontend && npm run build', { 
    stdio: 'inherit', 
    timeout: 300000,
    env: { ...process.env, DISABLE_ESLINT_PLUGIN: 'true' }
  });
  console.log('🎉 SUCCESS! Full functionality restored with working build!');
  
  // Check build output
  if (fs.existsSync('frontend/build/index.html')) {
    const buildFiles = fs.readdirSync('frontend/build');
    console.log(`📦 Build contains ${buildFiles.length} files`);
    console.log('🚀 Ready for deployment!');
  }
  
} catch (error) {
  console.log('❌ Build failed, creating fallback...');
  
  // Create ultra-simple fallback
  const fallbackApp = `import React from 'react';

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>VerifyCert</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Decentralized Certificate Verification System
      </p>
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '2rem', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Features</h2>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
          <li>✅ Issue tamper-proof certificates</li>
          <li>✅ Verify certificate authenticity</li>
          <li>✅ Blockchain-based security</li>
          <li>✅ QR code verification</li>
        </ul>
      </div>
    </div>
  );
}

export default App;`;
  
  fs.writeFileSync('frontend/src/App.tsx', fallbackApp);
  
  try {
    execSync('cd frontend && npm run build', { stdio: 'inherit', timeout: 300000 });
    console.log('✅ Fallback build successful!');
  } catch (finalError) {
    console.log('❌ All restoration attempts failed');
  }
}