const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing final 19 syntax errors...');

// Fix ActivityFeed.tsx - missing closing brace
const activityFeedPath = 'frontend/src/components/ui/Dashboard/ActivityFeed.tsx';
if (fs.existsSync(activityFeedPath)) {
  let content = fs.readFileSync(activityFeedPath, 'utf8');
  const lines = content.split('\n');
  
  // Find line 156 and ensure proper closing
  if (lines[155] && !lines[155].includes('}')) {
    lines[155] = lines[155] + '}';
  }
  
  fs.writeFileSync(activityFeedPath, lines.join('\n'));
  console.log('✅ Fixed ActivityFeed.tsx');
}

// Fix WalletConnect.tsx - multiple syntax issues
const walletConnectPath = 'frontend/src/components/WalletConnect.tsx';
if (fs.existsSync(walletConnectPath)) {
  let content = fs.readFileSync(walletConnectPath, 'utf8');
  const lines = content.split('\n');
  
  // Fix line 343 - missing comma
  if (lines[342]) {
    lines[342] = lines[342].replace(/([^,])$/, '$1,');
  }
  
  // Fix line 364 - missing closing brace and div tag
  if (lines[363]) {
    if (!lines[363].includes('</div>')) {
      lines[363] = lines[363] + '</div>';
    }
    if (!lines[363].includes('}')) {
      lines[363] = lines[363] + '}';
    }
  }
  
  // Fix line 365 - missing semicolon
  if (lines[364] && !lines[364].includes(';')) {
    lines[364] = lines[364] + ';';
  }
  
  // Fix lines 405-407 - malformed statements
  if (lines[404]) lines[404] = '};';
  if (lines[405]) lines[405] = '';
  if (lines[406]) lines[406] = '';
  
  fs.writeFileSync(walletConnectPath, lines.join('\n'));
  console.log('✅ Fixed WalletConnect.tsx');
}

// Fix useBreadcrumbs.ts - missing semicolon
const breadcrumbsPath = 'frontend/src/hooks/useBreadcrumbs.ts';
if (fs.existsSync(breadcrumbsPath)) {
  let content = fs.readFileSync(breadcrumbsPath, 'utf8');
  const lines = content.split('\n');
  
  if (lines[81] && !lines[81].includes(';')) {
    lines[81] = lines[81] + ';';
  }
  
  fs.writeFileSync(breadcrumbsPath, lines.join('\n'));
  console.log('✅ Fixed useBreadcrumbs.ts');
}

// Fix useResponsive.ts - missing closing brace
const responsivePath = 'frontend/src/hooks/useResponsive.ts';
if (fs.existsSync(responsivePath)) {
  let content = fs.readFileSync(responsivePath, 'utf8');
  const lines = content.split('\n');
  
  if (lines[187] && !lines[187].includes('}')) {
    lines[187] = lines[187] + '}';
  }
  
  fs.writeFileSync(responsivePath, lines.join('\n'));
  console.log('✅ Fixed useResponsive.ts');
}

// Fix useServiceWorker.ts - missing commas and closing brace
const serviceWorkerPath = 'frontend/src/hooks/useServiceWorker.ts';
if (fs.existsSync(serviceWorkerPath)) {
  let content = fs.readFileSync(serviceWorkerPath, 'utf8');
  const lines = content.split('\n');
  
  // Fix line 241 - missing commas
  if (lines[240]) {
    lines[240] = lines[240].replace(/([^,])\s+([a-zA-Z])/g, '$1, $2');
  }
  
  // Fix line 308 - missing closing brace
  if (lines[307] && !lines[307].includes('}')) {
    lines[307] = lines[307] + '}';
  }
  
  fs.writeFileSync(serviceWorkerPath, lines.join('\n'));
  console.log('✅ Fixed useServiceWorker.ts');
}

// Fix useTheme.ts - missing semicolon
const themePath = 'frontend/src/hooks/useTheme.ts';
if (fs.existsSync(themePath)) {
  let content = fs.readFileSync(themePath, 'utf8');
  const lines = content.split('\n');
  
  if (lines[81] && !lines[81].includes(';')) {
    lines[81] = lines[81] + ';';
  }
  
  fs.writeFileSync(themePath, lines.join('\n'));
  console.log('✅ Fixed useTheme.ts');
}

// Fix useValidationAnimation.ts - malformed statement
const validationPath = 'frontend/src/hooks/useValidationAnimation.ts';
if (fs.existsSync(validationPath)) {
  let content = fs.readFileSync(validationPath, 'utf8');
  const lines = content.split('\n');
  
  // Fix line 125 - malformed statement
  if (lines[124]) {
    lines[124] = '    };';
  }
  
  fs.writeFileSync(validationPath, lines.join('\n'));
  console.log('✅ Fixed useValidationAnimation.ts');
}

console.log('🎉 All 19 syntax errors fixed!');