// Universal Browser & Localhost Verification Script
// Run this in browser console to verify latest updates are loaded

function verifyLatestUpdates() {
  console.log('🔍 VERIFYING LATEST UPDATES...');
  console.log('=====================================');
  
  const results = {
    version: null,
    navigation: {},
    ui: {},
    functionality: {},
    overall: 'CHECKING...'
  };
  
  // Check app version
  const versionElement = document.documentElement.getAttribute('data-version');
  results.version = versionElement;
  console.log('📅 App Version:', versionElement || 'NOT FOUND');
  
  // Check navigation elements
  console.log('\n🧭 NAVIGATION CHECKS:');
  
  // Wallet connect button
  const walletBtn = document.querySelector('.connect-wallet-btn, [class*="wallet"]');
  results.navigation.walletConnect = !!walletBtn;
  console.log('💰 Wallet Connect Button:', walletBtn ? '✅ FOUND' : '❌ MISSING');
  
  // Theme toggle
  const themeToggle = document.querySelector('[title*="theme"], [aria-label*="theme"]');
  results.navigation.themeToggle = !!themeToggle;
  console.log('🌙 Theme Toggle:', themeToggle ? '✅ FOUND' : '❌ MISSING');
  
  // Sign in/up buttons
  const signInBtn = document.querySelector('a[href="/login"], a[href*="login"]');
  const signUpBtn = document.querySelector('a[href="/signup"], a[href*="signup"]');
  results.navigation.signIn = !!signInBtn;
  results.navigation.signUp = !!signUpBtn;
  console.log('🔐 Sign In Button:', signInBtn ? '✅ FOUND' : '❌ MISSING');
  console.log('📝 Sign Up Button:', signUpBtn ? '✅ FOUND' : '❌ MISSING');
  
  // Check UI improvements
  console.log('\n🎨 UI IMPROVEMENTS:');
  
  // Feedback button
  const feedbackBtn = document.querySelector('.feedback-button');
  results.ui.feedbackButton = !!feedbackBtn;
  console.log('💬 Feedback Button:', feedbackBtn ? '✅ FOUND' : '❌ MISSING');
  
  if (feedbackBtn) {
    const style = window.getComputedStyle(feedbackBtn);
    const size = `${style.width} x ${style.height}`;
    console.log('📏 Feedback Button Size:', size);
    console.log('📍 Feedback Button Position:', style.position, style.bottom, style.right);
  }
  
  // Check functionality
  console.log('\n⚙️ FUNCTIONALITY CHECKS:');
  
  // Test backend connection
  fetch('/health')
    .then(response => response.json())
    .then(data => {
      results.functionality.backend = true;
      console.log('🔗 Backend Connection:', '✅ WORKING');
      console.log('📡 Backend Response:', data);
    })
    .catch(error => {
      results.functionality.backend = false;
      console.log('🔗 Backend Connection:', '❌ FAILED');
      console.log('❌ Error:', error.message);
    });
  
  // Check for cache busting headers
  fetch(window.location.href, { method: 'HEAD' })
    .then(response => {
      const cacheControl = response.headers.get('cache-control');
      results.functionality.cacheControl = cacheControl;
      console.log('🚫 Cache Control:', cacheControl || 'NOT SET');
    })
    .catch(error => {
      console.log('🚫 Cache Control Check Failed:', error.message);
    });
  
  // Overall assessment
  setTimeout(() => {
    const navScore = Object.values(results.navigation).filter(Boolean).length;
    const uiScore = Object.values(results.ui).filter(Boolean).length;
    const funcScore = Object.values(results.functionality).filter(Boolean).length;
    
    const totalChecks = Object.values(results.navigation).length + Object.values(results.ui).length + Object.values(results.functionality).length;
    const passedChecks = navScore + uiScore + funcScore;
    
    console.log('\n📊 OVERALL ASSESSMENT:');
    console.log('======================');
    console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);
    
    if (passedChecks === totalChecks) {
      results.overall = 'ALL UPDATES LOADED ✅';
      console.log('🎉 STATUS: ALL LATEST UPDATES LOADED SUCCESSFULLY!');
    } else {
      results.overall = 'SOME UPDATES MISSING ❌';
      console.log('⚠️ STATUS: SOME UPDATES MISSING - CLEAR CACHE AND REFRESH');
      console.log('💡 Try: Ctrl+Shift+R or use Incognito mode');
    }
    
    console.log('\n📋 DETAILED RESULTS:', results);
  }, 2000);
  
  return results;
}

// Auto-run verification
verifyLatestUpdates();

// Export for manual use
window.verifyLatestUpdates = verifyLatestUpdates;