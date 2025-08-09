import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { LoadingButton } from '../LoadingButton';
import { toast } from 'react-hot-toast';

export const OTPVerificationForm: React.FC = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOTP(otp);
      toast.success('Account verified successfully!');
      // Navigation will be handled by AuthContext
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP();
      setTimeLeft(300); // Reset timer
      toast.success('Verification code sent successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <AuthLayout 
      title="Verify your account"
      subtitle="Enter the verification code sent to your email or phone"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            value={otp}
            onChange={handleOtpChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
          />
          <p className="mt-1 text-xs text-gray-500 text-center">
            Enter the 6-digit code sent to your email or phone
          </p>
        </div>

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          disabled={otp.length !== 6}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Verify Account
        </LoadingButton>

        <div className="text-center space-y-2">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in {formatTime(timeLeft)}
            </p>
          ) : (
            <p className="text-sm text-red-600">
              Verification code has expired
            </p>
          )}
          
          <LoadingButton
            type="button"
            onClick={handleResendOTP}
            isLoading={isResending}
            disabled={timeLeft > 240} // Allow resend after 1 minute
            className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            {timeLeft > 240 ? `Resend in ${formatTime(timeLeft - 240)}` : 'Resend Code'}
          </LoadingButton>
        </div>

        <div className="text-center">
          <a href="/signup" className="text-sm font-medium text-gray-600 hover:text-gray-500">
            ← Back to signup
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};