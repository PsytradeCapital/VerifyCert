// Test Frontend-Backend Connection
// Run this in your browser console to test the connection

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:4000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Registration endpoint
    console.log('2. Testing registration endpoint...');
    const registerResponse = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPass123!',
        region: 'US'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration test:', registerData);
    
    if (registerData.success) {
      console.log('🎉 Backend connection is working perfectly!');
      console.log('📧 Check your backend console for the OTP code');
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('🔧 Possible fixes:');
    console.log('- Make sure backend is running on port 4000');
    console.log('- Check if CORS is properly configured');
    console.log('- Try restarting both frontend and backend');
  }
}

// Run the test
testBackendConnection();