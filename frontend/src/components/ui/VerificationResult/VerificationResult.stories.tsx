import type { Meta, StoryObj } from '@storybook/react';
import { VerificationResult } from './VerificationResult';

const meta: Meta<typeof VerificationResult> = {
  title: 'UI/VerificationResult',
  component: VerificationResult,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Verified: Story = {
  args: {
    result: {
      valid: true,
      certificate: {
        id: '1',
        recipientName: 'John Doe',
        courseName: 'React Development',
        issuerName: 'Tech Academy',
        issueDate: '2024-01-15'
      }
    },
  },
};

export const Invalid: Story = {
  args: {
    result: {
      valid: false,
      error: 'Certificate not found'
    },
  },
};
