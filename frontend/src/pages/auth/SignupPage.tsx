import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { SignupForm } from '../../components/auth/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <AuthLayout>
      <SignupForm />
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};