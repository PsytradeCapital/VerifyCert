import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Tooltip } from './index';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Info, Help, Settings, User } from 'lucide-react';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const BasicTooltip: Story = {
  render: () => (
    <div className=\"p-8\">
      <Tooltip content=\"This is a basic tooltip\">
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const TooltipPositions: Story = {
  render: () => (
    <div className=\"grid grid-cols-2 gap-8 p-16\">
      <div className=\"text-center\">
        <Tooltip content=\"Top tooltip\" position=\"top\">
          <Button>Top</Button>
        </Tooltip>
      </div>
      <div className=\"text-center\">
        <Tooltip content=\"Bottom tooltip\" position=\"bottom\">
          <Button>Bottom</Button>
        </Tooltip>
      </div>
      <div className=\"text-center\">
        <Tooltip content=\"Left tooltip\" position=\"left\">
          <Button>Left</Button>
        </Tooltip>
      </div>
      <div className=\"text-center\">
        <Tooltip content=\"Right tooltip\" position=\"right\">
          <Button>Right</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const TooltipTriggers: Story = {
  render: () => (
    <div className=\"flex space-x-4 p-8\">
      <Tooltip content=\"Hover to see this tooltip\" trigger=\"hover\">
        <Button>Hover Trigger</Button>
      </Tooltip>
      <Tooltip content=\"Click to toggle this tooltip\" trigger=\"click\">
        <Button>Click Trigger</Button>
      </Tooltip>
      <Tooltip content=\"Focus to see this tooltip\" trigger=\"focus\">
        <Button>Focus Trigger</Button>
      </Tooltip>
    </div>
  ),
};

export const TooltipWithDelay: Story = {
  render: () => (
    <div className=\"flex space-x-4 p-8\">
      <Tooltip content=\"No delay\" delay={0}>
        <Button>No Delay</Button>
      </Tooltip>
      <Tooltip content=\"500ms delay\" delay={500}>
        <Button>500ms Delay</Button>
      </Tooltip>
      <Tooltip content=\"1000ms delay\" delay={1000}>
        <Button>1000ms Delay</Button>
      </Tooltip>
    </div>
  ),
};

export const TooltipWithoutArrow: Story = {
  render: () => (
    <div className=\"p-8\">
      <Tooltip content=\"This tooltip has no arrow\" arrow={false}>
        <Button>No Arrow</Button>
      </Tooltip>
    </div>
  ),
};

export const DisabledTooltip: Story = {
  render: () => (
    <div className=\"flex space-x-4 p-8\">
      <Tooltip content=\"This tooltip is enabled\">
        <Button>Enabled Tooltip</Button>
      </Tooltip>
      <Tooltip content=\"This tooltip is disabled\" disabled>
        <Button variant=\"outline\">Disabled Tooltip</Button>
      </Tooltip>
    </div>
  ),
};

export const ComplexTooltipContent: Story = {
  render: () => (
    <div className=\"p-8\">
      <Tooltip
        content={
          <div className=\"space-y-2\">
            <div className=\"font-semibold\">User Information</div>
            <div className=\"text-sm\">
              <div>Name: John Doe</div>
              <div>Email: john@example.com</div>
              <div>Role: Administrator</div>
            </div>
          </div>
        }
      >
        <Button icon={<User className=\"w-4 h-4\" />}>
          User Details
        </Button>
      </Tooltip>
    </div>
  ),
};

export const TooltipWithIcons: Story = {
  render: () => (
    <div className=\"flex space-x-4 p-8\">
      <Tooltip content=\"Get help and support\">
        <Button variant=\"outline\" size=\"sm\" icon={<Help className=\"w-4 h-4\" />} />
      </Tooltip>
      <Tooltip content=\"View more information\">
        <Button variant=\"outline\" size=\"sm\" icon={<Info className=\"w-4 h-4\" />} />
      </Tooltip>
      <Tooltip content=\"Open settings\">
        <Button variant=\"outline\" size=\"sm\" icon={<Settings className=\"w-4 h-4\" />} />
      </Tooltip>
    </div>
  ),
};

export const TooltipOnBadges: Story = {
  render: () => (
    <div className=\"flex space-x-4 p-8\">
      <Tooltip content=\"This user is currently online\">
        <Badge variant=\"success\">Online</Badge>
      </Tooltip>
      <Tooltip content=\"This order is pending approval\">
        <Badge variant=\"warning\">Pending</Badge>
      </Tooltip>
      <Tooltip content=\"This account has been verified\">
        <Badge variant=\"info\">Verified</Badge>
      </Tooltip>
    </div>
  ),
};

export const TooltipOnText: Story = {
  render: () => (
    <div className=\"p-8 max-w-md\">
      <p className=\"text-gray-700\">
        This is a paragraph with{' '}
        <Tooltip content=\"This is additional information about the highlighted text\">
          <span className=\"underline cursor-help text-blue-600\">
            tooltipped text
          </span>
        </Tooltip>
        {' '}that provides more context when hovered.
      </p>
    </div>
  ),
};

export const CustomStyledTooltip: Story = {
  render: () => (
    <div className=\"p-8\">
      <Tooltip
        content=\"This tooltip has custom styling\"
        tooltipClassName=\"bg-blue-600 text-white border border-blue-700\"
      >
        <Button>Custom Styled</Button>
      </Tooltip>
    </div>
  ),
};

export const LongContentTooltip: Story = {
  render: () => (
    <div className=\"p-8\">
      <Tooltip
        content=\"This is a very long tooltip content that demonstrates how the tooltip handles longer text. It should wrap appropriately and maintain good readability while staying within reasonable bounds.\"
      >
        <Button>Long Content</Button>
      </Tooltip>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => (
    <div className=\"p-8 space-y-8\">
      <div className=\"text-center\">
        <h3 className=\"text-lg font-semibold mb-4\">Interactive Tooltip Demo</h3>
        <p className=\"text-gray-600 mb-6\">
          Hover over the elements below to see tooltips in action
        </p>
      </div>

      <div className=\"grid grid-cols-3 gap-4\">
        <div className=\"text-center\">
          <Tooltip content=\"Save your current work\">
            <Button className=\"w-full\">Save</Button>
          </Tooltip>
        </div>
        <div className=\"text-center\">
          <Tooltip content=\"Cancel and discard changes\">
            <Button variant=\"outline\" className=\"w-full\">Cancel</Button>
          </Tooltip>
        </div>
        <div className=\"text-center\">
          <Tooltip content=\"Delete this item permanently\">
            <Button variant=\"destructive\" className=\"w-full\">Delete</Button>
          </Tooltip>
        </div>
      </div>

      <div className=\"flex justify-center space-x-4\">
        <Tooltip content=\"Administrator privileges\" position=\"top\">
          <Badge variant=\"success\" icon={<User className=\"w-3 h-3\" />}>
            Admin
          </Badge>
        </Tooltip>
        <Tooltip content=\"Premium subscription active\" position=\"top\">
          <Badge variant=\"warning\">Premium</Badge>
        </Tooltip>
        <Tooltip content=\"Account verified\" position=\"top\">
          <Badge variant=\"info\">Verified</Badge>
        </Tooltip>
      </div>
    </div>
  ),
};