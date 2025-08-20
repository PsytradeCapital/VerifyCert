import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Dropdown, { DropdownItem } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible dropdown component for creating context menus, action menus, and other dropdown interfaces.'
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end']
    },
    disabled: {
      control: 'boolean'
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const basicItems: DropdownItem[] = [
  { id: 'edit', label: 'Edit', onClick: () => alert('Edit clicked') },
  { id: 'duplicate', label: 'Duplicate', onClick: () => alert('Duplicate clicked') },
  { id: 'delete', label: 'Delete', onClick: () => alert('Delete clicked')
];

const itemsWithIcons: DropdownItem[] = [
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

const itemsWithDisabled: DropdownItem[] = [
  { id: 'new', label: 'New Document', onClick: () => alert('New clicked') },
  { id: 'open', label: 'Open', onClick: () => alert('Open clicked') },
  { id: 'save', label: 'Save', disabled: true, onClick: () => alert('Save clicked') },
  { id: 'divider1', label: '', divider: true },
  { id: 'export', label: 'Export', onClick: () => alert('Export clicked') },
  { id: 'print', label: 'Print', disabled: true, onClick: () => alert('Print clicked')
];

const contextMenuItems: DropdownItem[] = [
  { 
    id: 'cut', 
    label: 'Cut', 
    icon: <span>✂️</span>,
    onClick: () => alert('Cut clicked') 
  },
  { 
    id: 'copy', 
    label: 'Copy', 
    icon: <span>📋</span>,
    onClick: () => alert('Copy clicked') 
  },
  { 
    id: 'paste', 
    label: 'Paste', 
    icon: <span>📄</span>,
    onClick: () => alert('Paste clicked') 
  },
  { id: 'divider1', label: '', divider: true },
  { 
    id: 'selectAll', 
    label: 'Select All', 
    onClick: () => alert('Select All clicked')
];

export const Default: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Actions
      </button>
    ),
    items: basicItems
};

export const WithIcons: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors flex items-center">
        <span className="mr-2">👤</span>
        Account
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    ),
    items: itemsWithIcons
};

export const WithDisabledItems: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors">
        File Menu
      </button>
    ),
    items: itemsWithDisabled
};

export const ContextMenu: Story = {
  args: {
    trigger: (
      <div className="p-8 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-lg text-center text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-colors">
        Right-click me for context menu
        <br />
        <small>(or click for demo)</small>
      </div>
    ),
    items: contextMenuItems
};

export const IconButton: Story = {
  args: {
    trigger: (
      <button className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    ),
    items: basicItems
};

// Placement variants
export const BottomEnd: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Bottom End
      </button>
    ),
    items: basicItems,
    placement: 'bottom-end'
};

export const TopStart: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Top Start
      </button>
    ),
    items: basicItems,
    placement: 'top-start'
};

export const TopEnd: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
        Top End
      </button>
    ),
    items: basicItems,
    placement: 'top-end'
};

export const Disabled: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-300 text-neutral-500 rounded-lg cursor-not-allowed">
        Disabled Dropdown
      </button>
    ),
    items: basicItems,
    disabled: true
};

// Complex example with nested structure
export const ComplexMenu: Story = {
  args: {
    trigger: (
      <button className="px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center">
        <span className="mr-2">⚡</span>
        Quick Actions
        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    ),
    items: [
      { 
        id: 'create', 
        label: 'Create New', 
        icon: <span>➕</span>,
        onClick: () => alert('Create clicked') 
      },
      { 
        id: 'import', 
        label: 'Import Data', 
        icon: <span>📥</span>,
        onClick: () => alert('Import clicked') 
      },
      { id: 'divider1', label: '', divider: true },
      { 
        id: 'analytics', 
        label: 'View Analytics', 
        icon: <span>📊</span>,
        onClick: () => alert('Analytics clicked') 
      },
      { 
        id: 'reports', 
        label: 'Generate Report', 
        icon: <span>📋</span>,
        onClick: () => alert('Reports clicked') 
      },
      { id: 'divider2', label: '', divider: true },
      { 
        id: 'settings', 
        label: 'Advanced Settings', 
        icon: <span>⚙️</span>,
        onClick: () => alert('Settings clicked') 
      },
      { 
        id: 'backup', 
        label: 'Backup Data', 
        icon: <span>💾</span>,
        disabled: true,
        onClick: () => alert('Backup clicked')
    ]
};

// Multiple dropdowns example
export const MultipleDropdowns: Story = {
  render: () => (
    <div className="flex space-x-4">
      <Dropdown
        trigger={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            File
          </button>
        items={[
          { id: 'new', label: 'New', onClick: () => alert('New clicked') },
          { id: 'open', label: 'Open', onClick: () => alert('Open clicked') },
          { id: 'save', label: 'Save', onClick: () => alert('Save clicked')
        ]}
      />
      
      <Dropdown
        trigger={
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Edit
          </button>
        items={[
          { id: 'undo', label: 'Undo', onClick: () => alert('Undo clicked') },
          { id: 'redo', label: 'Redo', onClick: () => alert('Redo clicked') },
          { id: 'divider', label: '', divider: true },
          { id: 'cut', label: 'Cut', onClick: () => alert('Cut clicked') },
          { id: 'copy', label: 'Copy', onClick: () => alert('Copy clicked') },
          { id: 'paste', label: 'Paste', onClick: () => alert('Paste clicked')
        ]}
      />
      
      <Dropdown
        trigger={
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            View
          </button>
        items={[
          { id: 'zoom-in', label: 'Zoom In', onClick: () => alert('Zoom In clicked') },
          { id: 'zoom-out', label: 'Zoom Out', onClick: () => alert('Zoom Out clicked') },
          { id: 'fullscreen', label: 'Full Screen', onClick: () => alert('Full Screen clicked')
        ]}
      />
    </div>
  )
};
}}}}}}}}}}}}}}}}}}}}}}}}}