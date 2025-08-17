import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced Input component with floating labels, validation states, and smooth animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'floating'],
      description: 'Input variant style',
    },
    validationState: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning'],
      description: 'Validation state of the input',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the icon',
    },
    showValidationIcon: {
      control: 'boolean',
      description: 'Whether to show validation icons',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Search Icon Component
const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Email Icon Component
const EmailIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

// Lock Icon Component
const LockIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Enter text...',
    variant: 'default',
    size: 'md',
  },
};

export const FloatingLabel: Story = {
  args: {
    label: 'Floating Label',
    placeholder: 'Enter text...',
    variant: 'floating',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    variant: 'floating',
    icon: <SearchIcon />,
    iconPosition: 'left',
    size: 'md',
  },
};

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <Input
        label="Default State"
        placeholder="Enter text..."
        variant="floating"
        helperText="This is helper text"
      />
      <Input
        label="Success State"
        placeholder="Enter text..."
        variant="floating"
        validationState="success"
        helperText="Great! This looks good."
        value="valid@example.com"
        readOnly
      />
      <Input
        label="Warning State"
        placeholder="Enter text..."
        variant="floating"
        validationState="warning"
        helperText="This might need attention"
        value="warning@example"
        readOnly
      />
      <Input
        label="Error State"
        placeholder="Enter text..."
        variant="floating"
        error="This field is required"
        value=""
        readOnly
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Small Input"
        placeholder="Small size..."
        variant="floating"
        size="sm"
      />
      <Input
        label="Medium Input"
        placeholder="Medium size..."
        variant="floating"
        size="default"
      />
      <Input
        label="Large Input"
        placeholder="Large size..."
        variant="floating"
        size="lg"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Email"
        placeholder="Enter your email..."
        variant="floating"
        iconPosition="left"
        type="email"
      />
      <Input
        label="Password"
        placeholder="Enter your password..."
        variant="floating"
        iconPosition="left"
        type="password"
      />
      <Input
        label="Search"
        placeholder="Search..."
        variant="floating"
        iconPosition="right"
      />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const getEmailValidation = () => {
      if (!email) return { state: 'default' as const, message: 'Enter your email address' };
      if (!/\S+@\S+\.\S+/.test(email)) return { state: 'error' as const, message: 'Please enter a valid email address' };
      return { state: 'success' as const, message: 'Email looks good!' };
    };

    const getPasswordValidation = () => {
      if (!password) return { state: 'default' as const, message: 'Enter a secure password' };
      if (password.length < 8) return { state: 'warning' as const, message: 'Password should be at least 8 characters' };
      return { state: 'success' as const, message: 'Strong password!' };
    };

    const getConfirmPasswordValidation = () => {
      if (!confirmPassword) return { state: 'default' as const, message: 'Confirm your password' };
      if (password !== confirmPassword) return { state: 'error' as const, message: 'Passwords do not match' };
      return { state: 'success' as const, message: 'Passwords match!' };
    };

    const emailValidation = getEmailValidation();
    const passwordValidation = getPasswordValidation();
    const confirmPasswordValidation = getConfirmPasswordValidation();

    return (
      <div className="space-y-6 w-80">
        <h3 className="text-lg font-semibold text-neutral-900">Interactive Form</h3>
        <Input
          label="Email Address"
          placeholder="Enter your email..."
          variant="floating"
          iconPosition="left"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          validationState={emailValidation.state}
          error={emailValidation.state === 'error' ? emailValidation.message : undefined}
          helperText={emailValidation.state !== 'error' ? emailValidation.message : undefined}
        />
        <Input
          label="Password"
          placeholder="Enter your password..."
          variant="floating"
          iconPosition="left"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          validationState={passwordValidation.state}
          error={passwordValidation.state === 'error' ? passwordValidation.message : undefined}
          helperText={passwordValidation.state !== 'error' ? passwordValidation.message : undefined}
        />
        <Input
          label="Confirm Password"
          placeholder="Confirm your password..."
          variant="floating"
          iconPosition="left"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          validationState={confirmPasswordValidation.state}
          error={confirmPasswordValidation.state === 'error' ? confirmPasswordValidation.message : undefined}
          helperText={confirmPasswordValidation.state !== 'error' ? confirmPasswordValidation.message : undefined}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    variant: 'floating',
    disabled: true,
    value: 'Disabled value',
  },
};

export const WithoutValidationIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Success without icon"
        placeholder="Enter text..."
        variant="floating"
        validationState="success"
        showValidationIcon={false}
        helperText="Success state without validation icon"
        value="success@example.com"
        readOnly
      />
      <Input
        label="Error without icon"
        placeholder="Enter text..."
        variant="floating"
        showValidationIcon={false}
        error="Error state without validation icon"
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Default Variant</h3>
        <Input
          label="Basic Input"
          placeholder="Enter text..."
          variant="default"
        />
        <Input
          label="With Icon"
          placeholder="Search..."
          variant="default"
          iconPosition="left"
        />
        <Input
          label="Success State"
          placeholder="Enter text..."
          variant="default"
          validationState="success"
          helperText="This looks good!"
          value="success@example.com"
          readOnly
        />
        <Input
          label="Error State"
          placeholder="Enter text..."
          variant="default"
          error="This field is required"
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Floating Variant</h3>
        <Input
          label="Basic Input"
          placeholder="Enter text..."
          variant="floating"
        />
        <Input
          label="With Icon"
          placeholder="Search..."
          variant="floating"
          iconPosition="left"
        />
        <Input
          label="Success State"
          placeholder="Enter text..."
          variant="floating"
          validationState="success"
          helperText="This looks good!"
          value="success@example.com"
          readOnly
        />
        <Input
          label="Error State"
          placeholder="Enter text..."
          variant="floating"
          error="This field is required"
        />
      </div>
    </div>
  ),
};