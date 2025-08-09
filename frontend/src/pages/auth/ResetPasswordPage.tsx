import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <AuthLayout>
      <ResetPasswordForm onSuccess={handleSuccess} onBack={handleBack} />
    </AuthLayout>
  );
};