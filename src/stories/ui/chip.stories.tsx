import { Meta, StoryObj } from '@storybook/react';
import Chip from '@/components/ui/chip';

const meta: Meta<typeof Chip> = {
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    isActive: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    text: '뱃지 테스트',
    isActive: true,
  },
};
