import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import LoadingButton from '../LoadingButton';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emailOrPhone.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.emailOrPhone, formData.password);
      toast.success('Login successful!');
      // Navigation will be handled by AuthContext or parent component
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign in to your account"
      subtitle="Access your VerifyCert dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
            Email or Phone Number
          </label>
          <input
            id="emailOrPhone"
            name="emailOrPhone"
            type="text"
            required
            value={formData.emailOrPhone}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email or phone number"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Sign In
        </LoadingButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};