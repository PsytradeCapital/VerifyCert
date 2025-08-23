import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
}
}
}
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
}
}
}
  isAuthenticated: boolean;
  user: User | null;
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
}
}
}
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual authentication
    setIsAuthenticated(true);
    setUser({ id: '1', name: 'Demo User', email });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (data: any) => {
    // Mock register - replace with actual implementation
    console.log('Register:', data);
  };

  const verifyOTP = async (code: string) => {
    // Mock OTP verification - replace with actual implementation
    console.log('Verify OTP:', code);
    setIsAuthenticated(true);
    setUser({ id: '1', name: 'Demo User', email: 'demo@example.com' });
  };

  const resendOTP = async () => {
    // Mock resend OTP - replace with actual implementation
    console.log('Resend OTP');
  };

  const forgotPassword = async (emailOrPhone: string) => {
    // Mock forgot password - replace with actual implementation
    console.log('Forgot password:', emailOrPhone);
  };

  const value = {
    isAuthenticated,
    user,
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