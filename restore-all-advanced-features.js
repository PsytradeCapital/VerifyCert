const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Restoring ALL Advanced VerifyCert Features...');
console.log('This will restore the full-featured app with authentication, dashboard, wallet, themes, etc.');

// Step 1: Copy all backup files to src
function restoreAllFiles() {
  console.log('\n📁 Step 1: Restoring all files from backup...');
  
  const backupDir = 'frontend/src-backup';
  const targetDir = 'frontend/src';
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Copy all directories and files
  const copyRecursive = (src, dest) => {
    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const files = fs.readdirSync(src);
      files.forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
      console.log(`✅ Copied ${path.relative(backupDir, src)}`);
    }
  };
  
  // Copy everything from backup
  const backupContents = fs.readdirSync(backupDir);
  backupContents.forEach(item => {
    const srcPath = path.join(backupDir, item);
    const destPath = path.join(targetDir, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (item !== 'App-simple.tsx' && item !== 'index-simple.tsx') {
      // Skip simple versions, use full versions
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied ${item}`);
    }
  });
}

// Step 2: Fix any compilation issues
function fixCompilationIssues() {
  console.log('\n🔧 Step 2: Fixing compilation issues...');
  
  // Fix Navigation.tsx - add missing closing brace
  const navPath = 'frontend/src/components/Navigation.tsx';
  if (fs.existsSync(navPath)) {
    let navContent = fs.readFileSync(navPath, 'utf8');
    
    // Fix interface closing brace
    if (navContent.includes('onWalletDisconnect?: () => void;') && !navContent.includes('onWalletDisconnect?: () => void;\n}')) {
      navContent = navContent.replace(
        'onWalletDisconnect?: () => void;',
        'onWalletDisconnect?: () => void;\n}'
      );
    }
    
    // Fix any other syntax issues
    navContent = navContent.replace(/}\s*export const Navigation/g, '}\n\nexport const Navigation');
    
    fs.writeFileSync(navPath, navContent);
    console.log('✅ Fixed Navigation.tsx syntax');
  }
  
  // Fix AuthContext.tsx - add missing closing braces
  const authPath = 'frontend/src/contexts/AuthContext.tsx';
  if (fs.existsSync(authPath)) {
    let authContent = fs.readFileSync(authPath, 'utf8');
    
    // Fix interface definitions
    authContent = authContent.replace(
      /isVerified: boolean;(\s*)interface AuthState/g,
      'isVerified: boolean;\n}\n\ninterface AuthState'
    );
    
    authContent = authContent.replace(
      /isAuthenticated: boolean;(\s*)type AuthAction/g,
      'isAuthenticated: boolean;\n}\n\ntype AuthAction'
    );
    
    // Fix incomplete function definitions
    authContent = authContent.replace(
      /{ type: 'UPDATE_USER'; payload: User };(\s*)const initialState/g,
      '{ type: \'UPDATE_USER\'; payload: User };\n\nconst initialState'
    );
    
    // Fix incomplete interfaces
    authContent = authContent.replace(
      /changePassword: \(currentPassword: string, newPassword: string\) => Promise<void>;(\s*)interface RegisterData/g,
      'changePassword: (currentPassword: string, newPassword: string) => Promise<void>;\n}\n\ninterface RegisterData'
    );
    
    authContent = authContent.replace(
      /region\?: string;(\s*)const AuthContext/g,
      'region?: string;\n}\n\nconst AuthContext'
    );
    
    authContent = authContent.replace(
      /children: ReactNode;(\s*)export const AuthProvider/g,
      'children: ReactNode;\n}\n\nexport const AuthProvider'
    );
    
    // Fix incomplete function bodies
    authContent = authContent.replace(
      /} catch \(error\) \{(\s*)dispatch\(\{ type: 'AUTH_FAILURE' \}\);(\s*)throw error;(\s*)};/g,
      '} catch (error) {\n      dispatch({ type: \'AUTH_FAILURE\' });\n      throw error;\n    }\n  };'
    );
    
    fs.writeFileSync(authPath, authContent);
    console.log('✅ Fixed AuthContext.tsx syntax');
  }
}

// Step 3: Ensure all required dependencies are installed
function installDependencies() {
  console.log('\n📦 Step 3: Installing required dependencies...');
  
  const requiredDeps = [
    'lucide-react',
    'react-hot-toast',
    'framer-motion',
    '@types/react',
    '@types/react-dom'
  ];
  
  try {
    execSync(`cd frontend && npm install ${requiredDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.log('⚠️ Some dependencies may need manual installation');
  }
}

// Step 4: Create missing essential files
function createEssentialFiles() {
  console.log('\n📄 Step 4: Creating essential files...');
  
  // Create a working App.tsx if it doesn't exist or is too simple
  const appPath = 'frontend/src/App.tsx';
  if (!fs.existsSync(appPath) || fs.readFileSync(appPath, 'utf8').length < 1000) {
    const appContent = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';
import { Navigation } from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import VerificationPage from './pages/VerificationPage';
import IssuerDashboard from './pages/IssuerDashboard';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import OTPVerificationPage from './pages/auth/OTPVerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Styles
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/verify" element={<VerificationPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/verify-otp" element={<OTPVerificationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <IssuerDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;`;
    
    fs.writeFileSync(appPath, appContent);
    console.log('✅ Created comprehensive App.tsx');
  }
  
  // Create index.tsx if missing
  const indexPath = 'frontend/src/index.tsx';
  if (!fs.existsSync(indexPath)) {
    const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
    
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Created index.tsx');
  }
}

// Step 5: Test build
function testBuild() {
  console.log('\n🔨 Step 5: Testing build...');
  
  try {
    execSync('cd frontend && npm run build', { 
      stdio: 'pipe',
      timeout: 300000 
    });
    console.log('✅ Build successful!');
    return true;
  } catch (error) {
    console.log('❌ Build failed. Checking for specific errors...');
    
    // Try to identify and fix common issues
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
    
    if (errorOutput.includes('Cannot find module')) {
      console.log('📦 Missing dependencies detected. Installing...');
      try {
        execSync('cd frontend && npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed. Retrying build...');
        
        execSync('cd frontend && npm run build', { stdio: 'inherit' });
        console.log('✅ Build successful after dependency installation!');
        return true;
      } catch (retryError) {
        console.log('❌ Build still failing after dependency installation');
      }
    }
    
    console.log('Build error details:', errorOutput);
    return false;
  }
}

// Step 6: Start development server
function startDevServer() {
  console.log('\n🚀 Step 6: Starting development server...');
  console.log('The app will start with all advanced features:');
  console.log('✅ Authentication system (login/signup/OTP)');
  console.log('✅ Wallet connection (MetaMask integration)');
  console.log('✅ Theme switching (dark/light mode)');
  console.log('✅ Dashboard with certificate management');
  console.log('✅ User profiles and settings');
  console.log('✅ Responsive navigation');
  console.log('✅ Certificate verification');
  console.log('✅ Protected routes');
  console.log('');
  console.log('🌐 Starting server at http://localhost:3000');
  
  try {
    execSync('cd frontend && npm start', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Failed to start development server');
    console.log('You can manually start it with: cd frontend && npm start');
  }
}

// Main execution
async function main() {
  try {
    console.log('🎯 This will restore your full-featured VerifyCert application!');
    console.log('Features being restored:');
    console.log('- 🔐 Complete authentication system');
    console.log('- 💼 Issuer dashboard with certificate management');
    console.log('- 🔗 Wallet integration (MetaMask)');
    console.log('- 🎨 Theme system (dark/light mode)');
    console.log('- 📱 Responsive design');
    console.log('- 👤 User profiles and settings');
    console.log('- 🛡️ Protected routes and role-based access');
    console.log('- ✅ Certificate verification system');
    console.log('');
    
    restoreAllFiles();
    fixCompilationIssues();
    installDependencies();
    createEssentialFiles();
    
    const buildSuccess = testBuild();
    
    if (buildSuccess) {
      console.log('\\n🎉 SUCCESS! All advanced features restored!');
      console.log('\\n📋 Your VerifyCert app now includes:');
      console.log('✅ Full authentication system');
      console.log('✅ Wallet connection with MetaMask');
      console.log('✅ Dark/light theme switching');
      console.log('✅ Issuer dashboard');
      console.log('✅ Certificate management');
      console.log('✅ User profiles');
      console.log('✅ Responsive navigation');
      console.log('✅ Protected routes');
      console.log('');
      console.log('🚀 Ready to start development server? (y/n)');
      
      // For now, just show instructions
      console.log('\\n📖 To start the app:');
      console.log('cd frontend && npm start');
      console.log('\\nThen visit http://localhost:3000');
      
    } else {
      console.log('\\n⚠️ Build issues detected. Manual fixes may be needed.');
      console.log('Check the error messages above and fix any remaining syntax issues.');
    }
    
  } catch (error) {
    console.error('❌ Restoration failed:', error.message);
    console.log('\\n🔧 Manual steps you can try:');
    console.log('1. cd frontend && npm install');
    console.log('2. Fix any TypeScript errors in the files');
    console.log('3. npm run build');
    console.log('4. npm start');
  }
}

main();