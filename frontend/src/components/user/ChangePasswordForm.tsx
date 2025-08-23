import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingButton from '../LoadingButton';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Check } from 'lucide-react';

export const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.newPassword);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!isPasswordValid) {
      newErrors.newPassword = 'Password does not meet requirements';

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;

    setIsLoading(true);

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      
      toast.success('Password changed successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
  };

  const PasswordInput = ({ 
    name, 
    label, 
    value, 
    showPassword, 
    onToggle, 
    error 
  }: {
    name: string;
    label: string;
    value: string;
    showPassword: boolean;
    onToggle: () => void;
    error?: string;
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          className={w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          name="currentPassword"
          label="Current Password"
          value={formData.currentPassword}
          showPassword={showPasswords.current}
          onToggle={() => togglePasswordVisibility('current')}
          error={errors.currentPassword}
        />

        <PasswordInput
          name="newPassword"
          label="New Password"
          value={formData.newPassword}
          showPassword={showPasswords.new}
          onToggle={() => togglePasswordVisibility('new')}
          error={errors.newPassword}
        />

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</p>
            <div className="space-y-1">
              {Object.entries({
                length: 'At least 8 characters',
                uppercase: 'One uppercase letter',
                lowercase: 'One lowercase letter',
                number: 'One number',
                special: 'One special character (@$!%*?&)'
              }).map(([key, text]) => (
                <div key={key} className="flex items-center text-sm">
                  <Check 
                    size={16}
                    className={mr-2 ${
                      passwordRequirements[key as keyof typeof passwordRequirements] 
                        ? 'text-green-500' 
                        : 'text-gray-400 dark:text-gray-600'
                    }}
                  />
                  <span className={
                    passwordRequirements[key as keyof typeof passwordRequirements]
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <PasswordInput
          name="confirmPassword"
          label="Confirm New Password"
          value={formData.confirmPassword}
          showPassword={showPasswords.confirm}
          onToggle={() => togglePasswordVisibility('confirm')}
          error={errors.confirmPassword}
        />

        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Changing Password..."
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Change Password
        </LoadingButton>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
}
}