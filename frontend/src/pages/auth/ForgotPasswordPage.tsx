import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/reset-password');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <AuthLayout>
      <ForgotPasswordForm onSuccess={handleSuccess} onBack={handleBack} />
    </AuthLayout>
  );
};