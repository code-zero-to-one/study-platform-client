import { Meta, StoryObj } from '@storybook/react';
import Badge from '@/shared/ui/badge/index';

const meta: Meta<typeof Badge> = {
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['default', 'completed', 'incomplete'],
    },
    shape: {
      control: { type: 'select' },
      options: ['rectangle', 'round'],
    },
    leftIcon: {
      control: false,
    },
    rightIcon: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: '뱃지 테스트',
    color: 'default',
    shape: 'rectangle',
  },
};
