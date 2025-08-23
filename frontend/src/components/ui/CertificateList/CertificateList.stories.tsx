import type { Meta, StoryObj } from '@storybook/react';
import { CertificateList } from './CertificateList';

const meta: Meta<typeof CertificateList> = {
  title: 'UI/CertificateList',
  component: CertificateList,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    certificates: [
      {
        id: '1',
        recipientName: 'John Doe',
        courseName: 'React Development',
        issuerName: 'Tech Academy',
        issueDate: '2024-01-15',
        verified: true
      }
    ],
  },
};
