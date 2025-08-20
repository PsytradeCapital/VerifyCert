import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import MultiSelect from './MultiSelect';
import { SelectOption } from './Select';

const meta: Meta<typeof MultiSelect> = {
  title: 'UI/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A multi-selection component that allows users to select multiple options from a dropdown list with search functionality and tag display.'
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: 'boolean'
    },
    searchable: {
      control: 'boolean'
    },
    maxSelections: {
      control: 'number'
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

const basicOptions: SelectOption[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
  { value: 'option5', label: 'Option 5'
];

const skillsOptions: SelectOption[] = [
  { value: 'javascript', label: 'JavaScript', icon: <span>🟨</span>,
  { value: 'typescript', label: 'TypeScript', icon: <span>🔷</span>,
  { value: 'react', label: 'React', icon: <span>⚛️</span>,
  { value: 'vue', label: 'Vue.js', icon: <span>💚</span>,
  { value: 'angular', label: 'Angular', icon: <span>🅰️</span>,
  { value: 'node', label: 'Node.js', icon: <span>💚</span>,
  { value: 'python', label: 'Python', icon: <span>🐍</span>,
  { value: 'java', label: 'Java', icon: <span>☕</span>,
  { value: 'csharp', label: 'C#', icon: <span>🔷</span>,
  { value: 'php', label: 'PHP', icon: <span>🐘</span>
];

const categoriesOptions: SelectOption[] = [
  { 
    value: 'frontend', 
    label: 'Frontend Development', 
    description: 'User interface and user experience',
    icon: <span>🎨</span>,
  { 
    value: 'backend', 
    label: 'Backend Development', 
    description: 'Server-side logic and databases',
    icon: <span>⚙️</span>,
  { 
    value: 'mobile', 
    label: 'Mobile Development', 
    description: 'iOS and Android applications',
    icon: <span>📱</span>,
  { 
    value: 'devops', 
    label: 'DevOps & Infrastructure', 
    description: 'Deployment and system administration',
    icon: <span>🚀</span>,
  { 
    value: 'design', 
    label: 'UI/UX Design', 
    description: 'User interface and experience design',
    icon: <span>🎯</span>,
  { 
    value: 'data', 
    label: 'Data Science', 
    description: 'Analytics and machine learning',
    icon: <span>📊</span>
];

const optionsWithDisabled: SelectOption[] = [
  { value: 'available1', label: 'Available Option 1' },
  { value: 'available2', label: 'Available Option 2' },
  { value: 'disabled1', label: 'Disabled Option 1', disabled: true },
  { value: 'available3', label: 'Available Option 3' },
  { value: 'disabled2', label: 'Disabled Option 2', disabled: true },
  { value: 'available4', label: 'Available Option 4'
];

// Interactive wrapper for controlled stories
const MultiSelectWrapper = (args: any) => {
  const [value, setValue] = useState<string[]>(args.value || []);
  
  return (
    <div className="w-96">
      <MultiSelect
        {...args}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};

export const Default: Story = {
  render: MultiSelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select multiple options',
    label: 'Multiple Selection'
};

export const WithSearch: Story = {
  render: MultiSelectWrapper,
  args: {
    options: skillsOptions,
    placeholder: 'Search and select skills',
    label: 'Technical Skills',
    searchable: true
};

export const WithIcons: Story = {
  render: MultiSelectWrapper,
  args: {
    options: skillsOptions,
    placeholder: 'Select programming languages',
    label: 'Programming Languages',
    value: ['javascript', 'react']
};

export const WithDescriptions: Story = {
  render: MultiSelectWrapper,
  args: {
    options: categoriesOptions,
    placeholder: 'Select development areas',
    label: 'Areas of Expertise',
    searchable: true,
    value: ['frontend', 'backend']
};

export const WithMaxSelections: Story = {
  render: MultiSelectWrapper,
  args: {
    options: skillsOptions,
    placeholder: 'Select up to 3 skills',
    label: 'Top 3 Skills',
    maxSelections: 3,
    searchable: true,
    helperText: 'Choose your top 3 technical skills'
};

export const WithError: Story = {
  render: MultiSelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Select at least one option',
    label: 'Required Field',
    error: 'Please select at least one option'
};

export const WithHelperText: Story = {
  render: MultiSelectWrapper,
  args: {
    options: skillsOptions,
    placeholder: 'Select your skills',
    label: 'Technical Skills',
    helperText: 'Select all the technologies you are proficient in',
    searchable: true
};

export const Disabled: Story = {
  render: MultiSelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Disabled multiselect',
    label: 'Disabled State',
    disabled: true,
    value: ['option1', 'option2']
};

export const WithDisabledOptions: Story = {
  render: MultiSelectWrapper,
  args: {
    options: optionsWithDisabled,
    placeholder: 'Some options are disabled',
    label: 'Mixed Availability',
    searchable: true
};

// Size variants
export const SmallSize: Story = {
  render: MultiSelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Small multiselect',
    label: 'Small Size',
    size: 'sm',
    value: ['option1', 'option2']
};

export const LargeSize: Story = {
  render: MultiSelectWrapper,
  args: {
    options: basicOptions,
    placeholder: 'Large multiselect',
    label: 'Large Size',
    size: 'lg',
    value: ['option1', 'option2']
};

// Complex example with many selections
export const ManySelections: Story = {
  render: MultiSelectWrapper,
  args: {
    options: skillsOptions,
    placeholder: 'Select technologies',
    label: 'Technology Stack',
    searchable: true,
    value: ['javascript', 'typescript', 'react', 'node', 'python']
};

// Form example
export const FormExample: Story = {
  render: () => {
    const [skills, setSkills] = useState<string[]>(['javascript', 'react']);
    const [categories, setCategories] = useState<string[]>(['frontend']);
    const [interests, setInterests] = useState<string[]>([]);
    
    const interestOptions = [
      { value: 'ai', label: 'Artificial Intelligence' },
      { value: 'blockchain', label: 'Blockchain' },
      { value: 'iot', label: 'Internet of Things' },
      { value: 'ar', label: 'Augmented Reality' },
      { value: 'vr', label: 'Virtual Reality' },
      { value: 'quantum', label: 'Quantum Computing'
    ];
    
    return (
      <div className="w-96 space-y-6">
        <MultiSelect
          options={skillsOptions}
          value={skills}
          onChange={setSkills}
          placeholder="Select your skills"
          label="Technical Skills"
          searchable
          helperText="Choose all technologies you're proficient in"
        />
        
        <MultiSelect
          options={categoriesOptions}
          value={categories}
          onChange={setCategories}
          placeholder="Select development areas"
          label="Areas of Expertise"
          searchable
          maxSelections={3}
          helperText="Select up to 3 areas you specialize in"
        />
        
        <MultiSelect
          options={interestOptions}
          value={interests}
          onChange={setInterests}
          placeholder="Select emerging technologies"
          label="Areas of Interest"
          searchable
          helperText="What emerging technologies interest you?"
        />
      </div>
    );
};

// Performance example with many options
export const ManyOptions: Story = {
  render: MultiSelectWrapper,
  args: {
    options: Array.from({ length: 100 }, (_, i) => ({
      value: `option${i + 1}`,
      label: `Option ${i + 1}`,
      description: `This is option number ${i + 1}`
    })),
    placeholder: 'Search through many options',
    label: 'Large Dataset',
    searchable: true,
    helperText: 'This example demonstrates performance with 100 options'
};

// Real-world example: Team member selection
export const TeamMemberSelection: Story = {
  render: MultiSelectWrapper,
  args: {
    options: [
      { 
        value: 'john', 
        label: 'John Smith', 
        description: 'Frontend Developer',
        icon: <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">JS</div>,
      { 
        value: 'sarah', 
        label: 'Sarah Johnson', 
        description: 'Backend Developer',
        icon: <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">SJ</div>,
      { 
        value: 'mike', 
        label: 'Mike Chen', 
        description: 'UI/UX Designer',
        icon: <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">MC</div>,
      { 
        value: 'lisa', 
        label: 'Lisa Rodriguez', 
        description: 'Product Manager',
        icon: <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">LR</div>,
      { 
        value: 'david', 
        label: 'David Kim', 
        description: 'DevOps Engineer',
        icon: <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">DK</div>
    ],
    placeholder: 'Select team members',
    label: 'Project Team',
    searchable: true,
    maxSelections: 4,
    helperText: 'Select up to 4 team members for this project'
};
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}