import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { OTPVerificationForm } from '../../components/auth/OTPVerificationForm';

export const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <AuthLayout>
      <OTPVerificationForm onSuccess={handleSuccess} onBack={handleBack} />
    </AuthLayout>
  );
};