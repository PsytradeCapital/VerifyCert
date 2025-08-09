/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

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
}

// Create singleton instance
export const authService = new AuthService();
export default authService; User;
  token: string;
}

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  region?: string;
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'An error occurred');
    }
    
    return data;
  }

  async register(userData: RegisterData): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    await this.handleResponse(response);
  }

  async verifyOTP(code: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await this.handleResponse(response);
    return data.data;
  }

  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone, password }),
    });

    const data = await this.handleResponse(response);
    return data.data;
  }

  async validateToken(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await this.handleResponse(response);
    return data.data;
  }

  async forgotPassword(emailOrPhone: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone }),
    });

    await this.handleResponse(response);
  }

  async resetPassword(code: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, newPassword }),
    });

    await this.handleResponse(response);
  }

  async resendOTP(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await this.handleResponse(response);
    return data.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    await this.handleResponse(response);
  }

  logout(): void {
    // Clear any client-side data
    localStorage.removeItem('authToken');
  }
}

export const authService = new AuthService();