import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal, Dialog } from './index';
import { Button } from '../Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

// Modal Stories
export const BasicModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Basic Modal"
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              This is a basic modal with a title and close button.
            </p>
            <p className="text-gray-600">
              You can close it by clicking the X button, pressing Escape, or clicking outside.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const ModalSizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    return (
      <div className="space-x-4">
        {sizes.map((size) => (
          <Button key={size} onClick={() => setOpenModal(size)}>
            {size.toUpperCase()} Modal
          </Button>
        ))}
        
        {sizes.map((size) => (
          <Modal
            key={size}
            isOpen={openModal === size}
            onClose={() => setOpenModal(null)}
            title={`${size.toUpperCase()} Modal`}
            size={size}
          >
            <div className="p-6">
              <p className="text-gray-600">
                This is a {size} sized modal. The content adjusts to the modal size.
              </p>
            </div>
          </Modal>
        ))}
      </div>
    );
  },
};

export const ModalWithoutCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal without Close Button"
          showCloseButton={false}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              This modal doesn't have a close button in the header.
            </p>
            <p className="text-gray-600 mb-4">
              You can still close it by pressing Escape or clicking outside.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close Modal</Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const NonDismissibleModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Non-Dismissible Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Non-Dismissible Modal"
          closeOnBackdropClick={false}
          closeOnEscape={false}
        >
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              This modal can only be closed using the close button or programmatically.
            </p>
            <p className="text-gray-600 mb-4">
              Clicking outside or pressing Escape won't close it.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close Modal</Button>
          </div>
        </Modal>
      </>
    );
  },
};

// Dialog Stories
export const BasicDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirm Action"
          description="Are you sure you want to delete this item? This action cannot be undone."
          actions={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setIsOpen(false)}>
                Delete
              </Button>
            </>
        >
          <p className="text-gray-600">
            This item will be permanently removed from your account.
          </p>
        </Dialog>
      </>
    );
  },
};

export const FormDialog: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Form Dialog</Button>
        <Dialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Create New Item"
          actions={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Create
              </Button>
            </>
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter description"
              />
            </div>
          </div>
        </Dialog>
      </>
    );
  },
};

export const ScrollableModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Scrollable Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Scrollable Content"
        >
          <div className="p-6">
            {Array.from({ length: 50 }, (_, i) => (
              <p key={i} className="text-gray-600 mb-4">
                This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur 
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore 
                magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
                ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            ))}
          </div>
        </Modal>
      </>
    );
  },
};