import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Select, { SelectOption } from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable select component with search functionality, multiple variants, and comprehensive accessibility support.'
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled']
    },
    disabled: {
      control: 'boolean'
    },
    searchable: {
      control: 'boolean'
    },
    clearable: {
      control: 'boolean'
    },
    loading: {
      control: 'boolean'
};

export default meta;
type Story = StoryObj<typeof Select>;

const basicOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4'
];

const optionsWithIcons: SelectOption[] = [
  { value: 'user', label: 'User', icon: <span>👤</span>,
  { value: 'admin', label: 'Administrator', icon: <span>👑</span>,
  { value: 'moderator', label: 'Moderator', icon: <span>🛡️</span>,
  { value: 'guest', label: 'Guest', icon: <span>👻</span>
];

const optionsWithDescriptions: SelectOption[] = [
  { 
    value: 'basic', 
    label: 'Basic Plan', 
    description: 'Perfect for individuals getting started',
    icon: <span>📦</span>,
  { 
    value: 'pro', 
    label: 'Pro Plan', 
    description: 'Great for growing teams and businesses',
    icon: <span>🚀</span>,
  { 
    value: 'enterprise', 
    label: 'Enterprise Plan', 
    description: 'Advanced features for large organizations',
    icon: <span>🏢</span>
];

const optionsWithDisabled: SelectOption[] = [
  { value: 'available1', label: 'Available Option 1' },
  { value: 'available2', label: 'Available Option 2' },
  { value: 'disabled1', label: 'Disabled Option 1', disabled: true },
  { value: 'available3', label: 'Available Option 3' },
  { value: 'disabled2', label: 'Disabled Option 2', disabled: true
];

// Interactive wrapper for controlled stories
const SelectWrapper = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  
  return (
    <div className="w-80">
      <Select
        {...args}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const Default: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select an option',
    label: 'Choose Option'
};

export const WithSearch: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Search and select',
    label: 'Searchable Select',
    searchable: true
};

export const WithIcons: Story = {
  render: SelectWrapper,
  args: {
    options: optionsWithIcons,
    placeholder: 'Select a role',
    label: 'User Role'
};

export const WithDescriptions: Story = {
  render: SelectWrapper,
  args: {
    options: optionsWithDescriptions,
    placeholder: 'Choose your plan',
    label: 'Subscription Plan',
    searchable: true
};

export const Clearable: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select an option',
    label: 'Clearable Select',
    clearable: true,
    value: 'option2'
};

export const WithError: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select an option',
    label: 'Required Field',
    error: 'This field is required'
};

export const WithHelperText: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select an option',
    label: 'With Helper Text',
    helperText: 'Choose the option that best fits your needs'
};

export const Disabled: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select an option',
    label: 'Disabled Select',
    disabled: true,
    value: 'option2'
};

export const Loading: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Loading options...',
    label: 'Loading State',
    loading: true
};

export const WithDisabledOptions: Story = {
  render: SelectWrapper,
  args: {
    options: optionsWithDisabled,
    placeholder: 'Select an option',
    label: 'Some Options Disabled',
    searchable: true
};

// Size variants
export const SmallSize: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Small select',
    label: 'Small Size',
    size: 'sm'
};

export const LargeSize: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Large select',
    label: 'Large Size',
    size: 'lg'
};

// Variant styles
export const OutlinedVariant: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Outlined select',
    label: 'Outlined Variant',
    variant: 'outlined'
};

export const FilledVariant: Story = {
  render: SelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Filled select',
    label: 'Filled Variant',
    variant: 'filled'
};

// Complex example
export const ComplexExample: Story = {
  render: SelectWrapper,
  args: {
    options: optionsWithDescriptions,
    placeholder: 'Choose your subscription',
    label: 'Subscription Plan',
    helperText: 'You can change your plan at any time',
    searchable: true,
    clearable: true,
    size: 'lg'
};

// Multiple selects in a form
export const FormExample: Story = {
  render: () => {
    const [country, setCountry] = useState('');
    const [role, setRole] = useState('');
    const [plan, setPlan] = useState('');
    
    const countries = [
      { value: 'us', label: 'United States', icon: <span>🇺🇸</span>,
      { value: 'uk', label: 'United Kingdom', icon: <span>🇬🇧</span>,
      { value: 'ca', label: 'Canada', icon: <span>🇨🇦</span>,
      { value: 'au', label: 'Australia', icon: <span>🇦🇺</span>
    ];
    
    return (
      <div className="w-96 space-y-6">
        <Select
          options={countries}
          value={country}
          onChange={setCountry}
          placeholder="Select country"
          label="Country"
          searchable
        />
        
        <Select
          options={optionsWithIcons}
          value={role}
          onChange={setRole}
          placeholder="Select role"
          label="User Role"
          helperText="This determines your access level"
        />
        
        <Select
          options={optionsWithDescriptions}
          value={plan}
          onChange={setPlan}
          placeholder="Choose plan"
          label="Subscription Plan"
          searchable
          clearable
        />
      </div>
    );
};
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}