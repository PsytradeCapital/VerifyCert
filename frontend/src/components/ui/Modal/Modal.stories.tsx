import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    title: 'Example Modal',
    children: <p>This is modal content</p>,
  },
};
