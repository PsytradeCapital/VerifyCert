import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { ResetPasswordForm } from './ResetPasswordForm';
import LoadingButton from '../LoadingButton';
import { toast } from 'react-hot-toast';

export const ForgotPasswordForm: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrPhone.trim()) {
      toast.error('Please enter your email or phone number');
      return;

    setIsLoading(true);
    try {
      await forgotPassword(emailOrPhone);
      setIsCodeSent(true);
      toast.success('Password reset code sent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset code');
    } finally {
      setIsLoading(false);
  };

  if (isCodeSent) {
    return <ResetPasswordForm onSuccess={() => window.location.href = '/login'} />;

  return (
    <AuthLayout 
      title="Reset your password"
      subtitle="Enter your email or phone number to receive a reset code"
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
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email or phone number"
          />
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Send Reset Code
        </LoadingButton>

        <div className="text-center">
          <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-500">
            ← Back to login
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};