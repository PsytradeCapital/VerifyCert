/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { string } from "prop-types";

import { string } from "prop-types";

import { string } from "prop-types";

import { string } from "prop-types";

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  region: string;
  role: 'user' | 'issuer' | 'admin';
  isVerified: boolean;
}

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  region?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/auth${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error(`Auth API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<{ userId: number; verificationType: string }> {
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(emailOrPhone: string, password: string): Promise<LoginResponse> {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: emailOrPhone,
        password,
      }),
    });
  }

  async verifyOTP(code: string, userId?: number, type: string = 'email'): Promise<LoginResponse> {
    // If userId is not provided, try to get it from localStorage or context
    const storedUserId = userId || localStorage.getItem('pendingUserId');
    
    return this.makeRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        userId: storedUserId ? parseInt(storedUserId) : undefined,
        code,
        type,
      }),
    });
  }

  async resendOTP(userId?: number, type: string = 'email'): Promise<void> {
    const storedUserId = userId || localStorage.getItem('pendingUserId');
    
    return this.makeRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        userId: storedUserId ? parseInt(storedUserId) : undefined,
        type,
      }),
    });
  }

  async forgotPassword(emailOrPhone: string): Promise<{ userId: number }> {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        identifier: emailOrPhone,
      }),
    });
  }

  async resetPassword(code: string, newPassword: string, userId?: number): Promise<void> {
    const storedUserId = userId || localStorage.getItem('resetUserId');
    
    return this.makeRequest('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        userId: storedUserId ? parseInt(storedUserId) : undefined,
        code,
        newPassword,
      }),
    });
  }

  async validateToken(token: string): Promise<User> {
    // Temporarily store the token for this request
    const originalToken = localStorage.getItem('authToken');
    localStorage.setItem('authToken', token);
    
    try {
      const response = await this.makeRequest<{ user: User }>('/profile');
      return response.user;
    } finally {
      // Restore original token
      if (originalToken) {
        localStorage.setItem('authToken', originalToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/profile');
    return response.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.makeRequest<{ user: User }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.makeRequest('/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout errors - we'll clear local storage anyway
      console.warn('Logout API call failed:', error);
    }
  }

  // Utility methods
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  getTokenPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  async refreshToken(): Promise<string> {
    const response = await this.makeRequest<{ token: string }>('/refresh-token', {
      method: 'POST',
    });
    return response.token;
  }
}

  // Token refresh mechanism
  async refreshToken(): Promise<string> {
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) {
      throw new Error('No token to refresh');
    }

    try {
      const response = await this.makeRequest<{ token: string }>('/refresh-token', {
        method: 'POST',
      });
      
      localStorage.setItem('authToken', response.token);
      return response.token;
    } catch (error) {
      // If refresh fails, clear the token and redirect to login
      localStorage.removeItem('authToken');
      throw error;
    }
  }

  // Auto-refresh token if it's about to expire
  async ensureValidToken(): Promise<string> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token');
    }

    // Check if token expires in the next 5 minutes
    const payload = this.getTokenPayload(token);
    if (payload && payload.exp * 1000 - Date.now() < 5 * 60 * 1000) {
      return await this.refreshToken();
    }

    return token;
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;