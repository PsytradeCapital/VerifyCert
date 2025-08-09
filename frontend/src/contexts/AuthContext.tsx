import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  region: string;
  role: 'user' | 'issuer' | 'admin';
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyOTP: (code: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (emailOrPhone: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  resendOTP: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  region?: string;
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
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token on app load
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const user = await authService.validateToken(token);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        } catch (error) {
          localStorage.removeItem('authToken');
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(emailOrPhone, password);
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.register(data);
      // Don't set auth state yet - user needs to verify OTP first
      dispatch({ type: 'AUTH_FAILURE' });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const verifyOTP = async (code: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.verifyOTP(code);
      localStorage.setItem('authToken', response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const forgotPassword = async (emailOrPhone: string) => {
    await authService.forgotPassword(emailOrPhone);
  };

  const resetPassword = async (code: string, newPassword: string) => {
    await authService.resetPassword(code, newPassword);
  };

  const resendOTP = async () => {
    await authService.resendOTP();
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    verifyOTP,
    logout,
    forgotPassword,
    resetPassword,
    resendOTP,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};