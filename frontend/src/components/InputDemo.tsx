import React, { useState } from 'react';
import { Input } from './ui';

const InputDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Email validation
  const getEmailValidation = () => {
    if (!email) return { state: 'default' as const, message: 'Enter your email address' };
    if (!/\S+@\S+\.\S+/.test(email)) return { state: 'error' as const, message: 'Please enter a valid email address' };
    return { state: 'success' as const, message: 'Email looks good!' };
  };

  // Password validation
  const getPasswordValidation = () => {
    if (!password) return { state: 'default' as const, message: 'Enter a secure password' };
    if (password.length < 8) return { state: 'warning' as const, message: 'Password should be at least 8 characters' };
    return { state: 'success' as const, message: 'Strong password!' };
  };

  // Confirm password validation
  const getConfirmPasswordValidation = () => {
    if (!confirmPassword) return { state: 'default' as const, message: 'Confirm your password' };
    if (password !== confirmPassword) return { state: 'error' as const, message: 'Passwords do not match' };
    return { state: 'success' as const, message: 'Passwords match!' };
  };

  const emailValidation = getEmailValidation();
  const passwordValidation = getPasswordValidation();
  const confirmPasswordValidation = getConfirmPasswordValidation();

  // Icons
  const EmailIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  );

  const LockIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Enhanced Input Component</h1>
        <p className="text-neutral-600">Floating labels, validation states, and smooth animations</p>
      </div>

      {/* Interactive Form Demo */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Interactive Form Demo</h2>
        <div className="space-y-6 max-w-md">
          <Input
            label="Email Address"
            placeholder="Enter your email..."
            icon={<EmailIcon />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            validationState={emailValidation.state === 'error' ? 'error' : emailValidation.state === 'success' ? 'success' : 'default'}
            error={emailValidation.state === 'error' ? emailValidation.message : undefined}
            helperText={emailValidation.state === 'default' ? emailValidation.message : undefined}
          />
          <Input
            label="Password"
            placeholder="Enter your password..."
            icon={<LockIcon />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            validationState={passwordValidation.state === 'success' ? 'success' : 'default'}
            error={undefined}
            helperText={passwordValidation.state === 'warning' || passwordValidation.state === 'default' ? passwordValidation.message : undefined}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password..."
            variant="floating"
            icon={<LockIcon />}
            iconPosition="left"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            validationState={confirmPasswordValidation.state === 'error' ? 'error' : confirmPasswordValidation.state === 'success' ? 'success' : 'default'}
            error={confirmPasswordValidation.state === 'error' ? confirmPasswordValidation.message : undefined}
            helperText={confirmPasswordValidation.state === 'warning' || confirmPasswordValidation.state === 'default' ? confirmPasswordValidation.message : undefined}
            enableValidationAnimation={true}
            animationConfig={{
              duration: 300,
              enableSequence: true
            }}
          />
        </div>
      </div>

      {/* Validation States Demo */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Validation States with Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Default State"
            placeholder="Enter text..."
            variant="floating"
            helperText="This is helper text"
            enableValidationAnimation={true}
          />
          <Input
            label="Success State"
            placeholder="Enter text..."
            variant="floating"
            validationState="success"
            helperText="Great! This looks good."
            value="valid@example.com"
            readOnly
            enableValidationAnimation={true}
          />
          <Input
            label="Warning State"
            placeholder="Enter text..."
            variant="floating"
            validationState="warning"
            helperText="This might need attention"
            value="warning@example"
            readOnly
            enableValidationAnimation={true}
          />
          <Input
            label="Error State"
            placeholder="Enter text..."
            variant="floating"
            error="This field is required"
            value=""
            readOnly
            enableValidationAnimation={true}
          />
        </div>
      </div>

      {/* Animation Showcase */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Validation Animation Showcase</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800">Error Animations</h3>
              <Input
                label="Shake Animation"
                placeholder="Type something invalid..."
                variant="floating"
                error="Invalid input - watch the shake!"
                enableValidationAnimation={true}
                animationConfig={{ enableSequence: true }}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800">Success Animations</h3>
              <Input
                label="Bounce Animation"
                placeholder="Valid input..."
                variant="floating"
                validationState="success"
                helperText="Success with bounce effect!"
                value="success@example.com"
                readOnly
                enableValidationAnimation={true}
                animationConfig={{ enableSequence: true }}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-800">Warning Animations</h3>
              <Input
                label="Wiggle Animation"
                placeholder="Needs attention..."
                variant="floating"
                validationState="warning"
                helperText="Warning with wiggle effect!"
                value="warning@incomplete"
                readOnly
                enableValidationAnimation={true}
                animationConfig={{ enableSequence: true }}
              />
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">
              <strong>Animation Features:</strong> Smooth transitions, staggered sequences, 
              icon pop-ins, message slide-ins, and field shake/bounce effects. 
              All animations respect user's reduced motion preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Sizes Demo */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Different Sizes</h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Small Input"
            placeholder="Small size..."
            variant="floating"
            size="sm"
            icon={<SearchIcon />}
          />
          <Input
            label="Medium Input"
            placeholder="Medium size..."
            variant="floating"
            size="md"
            icon={<SearchIcon />}
          />
          <Input
            label="Large Input"
            placeholder="Large size..."
            variant="floating"
            size="lg"
            icon={<SearchIcon />}
          />
        </div>
      </div>

      {/* Variants Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Variant Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">Default Variant</h3>
            <Input
              label="Email Address"
              placeholder="Enter your email..."
              variant="default"
              icon={<EmailIcon />}
              iconPosition="left"
              type="email"
            />
            <Input
              label="Search"
              placeholder="Search..."
              variant="default"
              icon={<SearchIcon />}
              iconPosition="right"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-800">Floating Variant</h3>
            <Input
              label="Email Address"
              placeholder="Enter your email..."
              variant="floating"
              icon={<EmailIcon />}
              iconPosition="left"
              type="email"
            />
            <Input
              label="Search"
              placeholder="Search..."
              variant="floating"
              icon={<SearchIcon />}
              iconPosition="right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputDemo;