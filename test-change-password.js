/**
 * Test script to verify change password functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';

async function testChangePassword() {
  try {
    console.log('Testing change password functionality...');
    
    // First, let's test if the server is running
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error('Server is not running');
    }
    
    console.log('✅ Server is running');
    
    // Test the change password endpoint (should fail without auth)
    const changePasswordResponse = await fetch(`${BASE_URL}/api/user/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: 'test123',
        newPassword: 'newtest123'
      })
    });
    
    const result = await changePasswordResponse.json();
    console.log('Change password response:', result);
    
    if (changePasswordResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else {
      console.log('❌ Unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChangePassword();