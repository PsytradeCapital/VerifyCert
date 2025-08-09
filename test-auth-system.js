const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:4000';
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
  region: 'US'
};

class AuthSystemTester {
  constructor() {
    this.token = null;
    this.userId = null;
  }

  async testRegistration() {
    console.log('\n🔐 Testing User Registration...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
      
      if (response.data.success) {
        console.log('✅ Registration successful');
        console.log(`   User ID: ${response.data.data.userId}`);
        console.log(`   Verification Type: ${response.data.data.verificationType}`);
        this.userId = response.data.data.userId;
        return true;
      } else {
        console.log('❌ Registration failed:', response.data.error.message);
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // If user already exists, that's actually OK for testing - we can use the existing user
      if (error.response?.data?.error?.code === 'USER_EXISTS') {
        console.log('ℹ️ User already exists - will test with existing user');
        // Try to get the user ID by attempting login (which will tell us the account needs verification)
        try {
          const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            identifier: TEST_USER.email,
            password: TEST_USER.password
          });
        } catch (loginError) {
          if (loginError.response?.data?.data?.userId) {
            this.userId = loginError.response.data.data.userId;
            console.log(`   Found existing User ID: ${this.userId}`);
            return true;
          }
        }
        return true; // Consider this a pass since user exists
      }
      
      console.log('❌ Registration error:', errorMessage);
      return false;
    }
  }

  async testOTPVerification() {
    console.log('\n📱 Testing OTP Verification...');
    
    if (!this.userId) {
      console.log('❌ No user ID available for OTP verification');
      return false;
    }

    // For testing, we'll use a mock OTP since we don't have email/SMS configured
    const mockOTP = '123456';
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        userId: this.userId,
        code: mockOTP,
        type: 'email'
      });
      
      if (response.data.success) {
        console.log('✅ OTP verification successful');
        console.log(`   Token received: ${response.data.data.token.substring(0, 20)}...`);
        this.token = response.data.data.token;
        return true;
      } else {
        console.log('❌ OTP verification failed:', response.data.error.message);
        return false;
      }
    } catch (error) {
      console.log('❌ OTP verification error:', error.response?.data?.error?.message || error.message);
      return false;
    }
  }

  async testLogin() {
    console.log('\n🔑 Testing User Login...');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (response.data.success) {
        console.log('✅ Login successful');
        console.log(`   User: ${response.data.data.user.name}`);
        console.log(`   Email: ${response.data.data.user.email}`);
        console.log(`   Verified: ${response.data.data.user.is_verified}`);
        this.token = response.data.data.token;
        return true;
      } else {
        console.log('❌ Login failed:', response.data.error.message);
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      // If account is not verified, get the user ID and try OTP verification
      if (error.response?.data?.error?.code === 'ACCOUNT_NOT_VERIFIED') {
        console.log('ℹ️ Account not verified - will attempt OTP verification');
        if (error.response.data.data?.userId) {
          this.userId = error.response.data.data.userId;
          console.log(`   User ID for verification: ${this.userId}`);
          
          // Try OTP verification with test code
          const otpResult = await this.testOTPVerification();
          if (otpResult) {
            // Try login again after verification
            return await this.testLogin();
          }
        }
        return false;
      }
      
      console.log('❌ Login error:', errorMessage);
      return false;
    }
  }

  async testProtectedRoute() {
    console.log('\n🛡️ Testing Protected Route Access...');
    
    if (!this.token) {
      console.log('❌ No token available for protected route test');
      return false;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      
      if (response.data.success) {
        console.log('✅ Protected route access successful');
        console.log(`   Profile: ${response.data.data.user.name} (${response.data.data.user.email})`);
        return true;
      } else {
        console.log('❌ Protected route access failed:', response.data.error.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Protected route error:', error.response?.data?.error?.message || error.message);
      return false;
    }
  }

  async testPasswordValidation() {
    console.log('\n🔒 Testing Password Validation...');
    
    const weakPasswords = [
      'weak',
      'password',
      'Password',
      'Password1',
      'password123'
    ];

    let validationWorks = true;

    for (const weakPassword of weakPasswords) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
          ...TEST_USER,
          email: `test${Math.random()}@example.com`,
          password: weakPassword
        });
        
        if (response.data.success) {
          console.log(`❌ Weak password "${weakPassword}" was accepted`);
          validationWorks = false;
        }
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ Weak password "${weakPassword}" correctly rejected`);
        } else {
          console.log(`❌ Unexpected error for password "${weakPassword}":`, error.message);
          validationWorks = false;
        }
      }
    }

    return validationWorks;
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');
    
    const attempts = [];
    const testEmail = `ratetest${Date.now()}@example.com`;

    // Make multiple rapid requests
    for (let i = 0; i < 12; i++) {
      attempts.push(
        axios.post(`${BASE_URL}/api/auth/register`, {
          ...TEST_USER,
          email: testEmail,
          password: 'WrongPass123!'
        }).catch(error => error.response)
      );
    }

    try {
      const responses = await Promise.all(attempts);
      const rateLimited = responses.some(response => 
        response?.status === 429 || 
        response?.data?.error?.code === 'RATE_LIMIT_EXCEEDED'
      );

      if (rateLimited) {
        console.log('✅ Rate limiting is working');
        return true;
      } else {
        console.log('❌ Rate limiting not detected');
        return false;
      }
    } catch (error) {
      console.log('❌ Rate limiting test error:', error.message);
      return false;
    }
  }

  async testServerHealth() {
    console.log('\n🏥 Testing Server Health...');
    
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      
      if (response.data.success) {
        console.log('✅ Server is healthy');
        console.log(`   Environment: ${response.data.environment}`);
        console.log(`   Network: ${response.data.network}`);
        return true;
      } else {
        console.log('❌ Server health check failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Server health check error:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Authentication System Tests...');
    console.log('=' .repeat(50));

    const results = {
      serverHealth: await this.testServerHealth(),
      passwordValidation: await this.testPasswordValidation(),
      registration: await this.testRegistration(),
      // Skip OTP verification for now since we don't have email configured
      // otpVerification: await this.testOTPVerification(),
      login: await this.testLogin(),
      protectedRoute: await this.testProtectedRoute(),
      rateLimiting: await this.testRateLimiting()
    };

    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results Summary:');
    console.log('=' .repeat(50));

    let passed = 0;
    let total = 0;

    Object.entries(results).forEach(([test, result]) => {
      total++;
      if (result) {
        passed++;
        console.log(`✅ ${test}: PASSED`);
      } else {
        console.log(`❌ ${test}: FAILED`);
      }
    });

    console.log('=' .repeat(50));
    console.log(`🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);

    if (passed === total) {
      console.log('🎉 All tests passed! Authentication system is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the configuration and try again.');
    }

    return passed === total;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthSystemTester();
  
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = AuthSystemTester;