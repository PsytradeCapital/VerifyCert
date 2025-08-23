import React, { useState } from 'react';
import { Select, Dropdown, MultiSelect } from './ui/Select';
import type { SelectOption, DropdownItem } from './ui/Select';

const SelectDemo: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [multiSelectedValues, setMultiSelectedValues] = useState<string[]>([]);

  const basicOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4'
  ];

  const skillsOptions: SelectOption[] = [
    { value: 'javascript', label: 'JavaScript', icon: <span>🟨</span>,
    { value: 'typescript', label: 'TypeScript', icon: <span>🔷</span>,
    { value: 'react', label: 'React', icon: <span>⚛️</span>,
    { value: 'vue', label: 'Vue.js', icon: <span>💚</span>,
    { value: 'angular', label: 'Angular', icon: <span>🅰️</span>
  ];

  const planOptions: SelectOption[] = [
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

  const dropdownItems: DropdownItem[] = [
    { 
      id: 'profile', 
      label: 'View Profile', 
      icon: <span>👤</span>,
      onClick: () => alert('Profile clicked') 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <span>⚙️</span>,
      onClick: () => alert('Settings clicked') 
    },
    { id: 'divider1', label: '', divider: true },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: <span>❓</span>,
      onClick: () => alert('Help clicked') 
    },
    { 
      id: 'logout', 
      label: 'Sign Out', 
      icon: <span>🚪</span>,
      onClick: () => alert('Logout clicked')
  ];

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Select Components Demo
        </h1>
        <p className="text-neutral-600">
          Comprehensive select, dropdown, and multi-select components with search functionality
        </p>
      </div>

      {/* Basic Select */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Basic Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Select
            options={basicOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Select an option"
            label="Basic Select"
          />
          
          <Select
            options={basicOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Search and select"
            label="Searchable Select"
            searchable
          />
          
          <Select
            options={basicOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Clearable select"
            label="Clearable Select"
            clearable
          />
        </div>
      </section>

      {/* Select with Icons and Descriptions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Enhanced Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            options={skillsOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Select a technology"
            label="With Icons"
            searchable
          />
          
          <Select
            options={planOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            placeholder="Choose your plan"
            label="With Descriptions"
            searchable
            clearable
          />
        </div>
      </section>

      {/* Select Variants and Sizes */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Variants & Sizes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            options={basicOptions}
            placeholder="Default variant"
            label="Default"
            size="sm"
          />
          
          <Select
            options={basicOptions}
            placeholder="Outlined variant"
            label="Outlined"
            variant="outlined"
            size="default"
          />
          
          <Select
            options={basicOptions}
            placeholder="Filled variant"
            label="Filled"
            variant="filled"
            size="lg"
          />
        </div>
      </section>

      {/* MultiSelect */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Multi-Select</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MultiSelect
            options={skillsOptions}
            value={multiSelectedValues}
            onChange={setMultiSelectedValues}
            placeholder="Select multiple skills"
            label="Technical Skills"
            searchable
            helperText="Choose all technologies you're proficient in"
          />
          
          <MultiSelect
            options={planOptions}
            value={multiSelectedValues}
            onChange={setMultiSelectedValues}
            placeholder="Select up to 2 plans"
            label="Limited Selection"
            maxSelections={2}
            searchable
            helperText="You can select up to 2 plans"
          />
        </div>
      </section>

      {/* Dropdown */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Dropdown Menu</h2>
        <div className="flex flex-wrap gap-4">
          <Dropdown
            trigger={
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                <span className="mr-2">👤</span>
                Account Menu
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            items={dropdownItems}
          />
          
          <Dropdown
            trigger={
              <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            items={[
              { id: 'edit', label: 'Edit', onClick: () => alert('Edit clicked') },
              { id: 'duplicate', label: 'Duplicate', onClick: () => alert('Duplicate clicked') },
              { id: 'delete', label: 'Delete', onClick: () => alert('Delete clicked')
            ]}
            placement="bottom-end"
          />
        </div>
      </section>

      {/* Error States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Error States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            options={basicOptions}
            placeholder="Select an option"
            label="Required Field"
            error="This field is required"
          />
          
          <MultiSelect
            options={skillsOptions}
            placeholder="Select skills"
            label="Skills Required"
            error="Please select at least one skill"
          />
        </div>
      </section>

      {/* Loading and Disabled States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-800">Special States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            options={basicOptions}
            placeholder="Loading options..."
            label="Loading State"
            loading
          />
          
          <Select
            options={basicOptions}
            value="option2"
            placeholder="Disabled select"
            label="Disabled State"
            disabled
          />
          
          <MultiSelect
            options={skillsOptions}
            value={['javascript', 'react']}
            placeholder="Disabled multiselect"
            label="Disabled Multi-Select"
            disabled
          />
        </div>
      </section>

      {/* Current Selections Display */}
      <section className="bg-neutral-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">Current Selections</h3>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            <strong>Single Select:</strong> {selectedValue || 'None selected'}
          </p>
          <p className="text-sm text-neutral-600">
            <strong>Multi Select:</strong> {multiSelectedValues.length > 0 ? multiSelectedValues.join(', ') : 'None selected'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default SelectDemo;
}
}}}}}}}}}}}}