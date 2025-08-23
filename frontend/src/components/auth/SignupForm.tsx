import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import LoadingButton from '../LoadingButton';
import { toast } from 'react-hot-toast';
import { OTPVerificationForm } from './OTPVerificationForm';

interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  authMethod: 'email' | 'phone';
  region: string;

export const SignupForm: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    authMethod: 'email',
    region: 'US',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    
    if (formData.authMethod === 'email') {
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return 'Please enter a valid email address';
    } else {
      if (!formData.phone.trim()) return 'Phone number is required';
      if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
        return 'Please enter a valid phone number';

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;

    setIsLoading(true);
    try {
      const registerData = {
        name: formData.name,
        password: formData.password,
        region: formData.region,
        ...(formData.authMethod === 'email' 
          ? { email: formData.email
          : { phone: formData.phone
        ),
      };

      await register(registerData);
      setShowOTPForm(true);
      toast.success(`Verification code sent to your ${formData.authMethod}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
  };

  if (showOTPForm) {
    return <OTPVerificationForm />;

  return (
    <AuthLayout 
      title="Create your account"
      subtitle="Join VerifyCert to issue and manage certificates"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Authentication Method Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sign up with
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="authMethod"
                value="email"
                checked={formData.authMethod === 'email'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Email
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="authMethod"
                value="phone"
                checked={formData.authMethod === 'phone'}
                onChange={handleInputChange}
                className="mr-2"
              />
              Phone
            </label>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email or Phone Field */}
        {formData.authMethod === 'email' ? (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
        )}

        {/* Region Field */}
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="IN">India</option>
            <option value="NG">Nigeria</option>
            <option value="KE">Kenya</option>
            <option value="ZA">South Africa</option>
          </select>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Create a strong password"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your password"
          />
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Create Account
        </LoadingButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};
}}}