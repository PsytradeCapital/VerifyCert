import React from 'react';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  const handleSuccess = () => {
    // Redirect to login page after successful password reset
    window.location.href = '/login';
  };

  const handleBack = () => {
    // Go back to login page
    window.location.href = '/login';
  };

  return (
    <ResetPasswordForm 
      onSuccess={handleSuccess}
      onBack={handleBack}
    />
  );
};