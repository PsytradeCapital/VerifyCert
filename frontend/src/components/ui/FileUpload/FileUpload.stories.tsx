import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import FileUpload from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'UI/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A file upload component with drag-and-drop support, file validation, and preview functionality.'
  },
  argTypes: {
    onFileSelect: {
      description: 'Callback function called when files are selected',
      action: 'files selected'
    },
    accept: {
      description: 'Accepted file types (same as HTML input accept attribute)',
      control: 'text'
    },
    multiple: {
      description: 'Allow multiple file selection',
      control: 'boolean'
    },
    maxSize: {
      description: 'Maximum file size in bytes',
      control: 'number'
    },
    label: {
      description: 'Label text for the upload area',
      control: 'text'
    },
    error: {
      description: 'Error message to display',
      control: 'text'
    },
    helperText: {
      description: 'Helper text to display below the upload area',
      control: 'text'
    },
    disabled: {
      description: 'Disable the file upload',
      control: 'boolean'
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text'
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    onFileSelect: action('files selected')
};

export const WithLabel: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Certificate Files'
};

export const MultipleFiles: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Multiple Files',
    multiple: true,
    helperText: 'You can select multiple files at once'
};

export const WithFileTypeRestriction: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload PDF Documents',
    accept: '.pdf',
    helperText: 'Only PDF files are allowed'
};

export const WithSizeLimit: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Images',
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    helperText: 'Maximum file size: 5MB'
};

export const WithError: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Files',
    error: 'File upload failed. Please try again.'
};

export const Disabled: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Files',
    disabled: true,
    helperText: 'File upload is currently disabled'
};

export const ImageUpload: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Profile Picture',
    accept: 'image/jpeg,image/png,image/gif',
    maxSize: 2 * 1024 * 1024, // 2MB
    helperText: 'Accepted formats: JPEG, PNG, GIF (max 2MB)'
};

export const DocumentUpload: Story = {
  args: {
    onFileSelect: action('files selected'),
    label: 'Upload Certificate Documents',
    accept: '.pdf,.doc,.docx',
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    helperText: 'Upload PDF or Word documents (max 10MB each)'
};

export const CompactVersion: Story = {
  args: {
    onFileSelect: action('files selected'),
    className: 'max-w-md'
  },
  parameters: {
    docs: {
      description: {
        story: 'A more compact version of the file upload component'
};

// Interactive example showing file validation
export const WithValidation: Story = {
  args: {
    onFileSelect: (files: File[]) => {
      action('files selected')(files);
      // This would normally show validation results
      console.log('Selected files:', files.map(f => ({ name: f.name, size: f.size })));
    },
    label: 'Upload with Validation',
    accept: '.jpg,.jpeg,.png,.pdf',
    maxSize: 1024 * 1024, // 1MB
    multiple: true,
    helperText: 'Try uploading files larger than 1MB to see validation in action'
  },
  parameters: {
    docs: {
      description: {
        story: 'This example demonstrates file validation. Try uploading files larger than 1MB or with unsupported formats to see validation errors in the browser console.'
};