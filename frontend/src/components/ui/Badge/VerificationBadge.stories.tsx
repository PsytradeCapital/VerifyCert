import type { Meta, StoryObj } from '@storybook/react';
import { VerificationBadge } from './VerificationBadge';

const meta: Meta<typeof VerificationBadge> = {
  title: 'UI/Badge/VerificationBadge',
  component: VerificationBadge,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    verified: true,
  },
};

export const Unverified: Story = {
  args: {
    verified: false,
  },
};
