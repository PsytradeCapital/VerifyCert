import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  forgotPassword: (emailOrPhone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual authentication
      setIsAuthenticated(true);
      setUser({ 
        id: '1', 
        name: 'Demo User', 
        email, 
        role: 'user',
        isVerified: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      // Mock register - replace with actual implementation
      console.log('Register:', data);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (code: string) => {
    setIsLoading(true);
    try {
      // Mock OTP verification - replace with actual implementation
      console.log('Verify OTP:', code);
      setIsAuthenticated(true);
      setUser({ 
        id: '1', 
        name: 'Demo User', 
        email: 'demo@example.com',
        role: 'user',
        isVerified: true 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      // Mock resend OTP - replace with actual implementation
      console.log('Resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (emailOrPhone: string) => {
    setIsLoading(true);
    try {
      // Mock forgot password - replace with actual implementation
      console.log('Forgot password:', emailOrPhone);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};