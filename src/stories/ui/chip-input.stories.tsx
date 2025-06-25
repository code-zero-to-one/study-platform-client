import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import ChipInput from '@/shared/ui/chip-input';

const meta = {
  title: 'UI/ChipInput',
  tags: ['autodocs'],
  component: ChipInput,
  argTypes: {
    chips: {
      description: '텍스트를 입력하면 Chip 을 생성합니다.',
      control: {
        type: 'object',
        options: ['chip1', 'chip2', 'chip3'],
      },
    },
  },
} satisfies Meta<typeof ChipInput>;

export default meta;
type Story = StoryObj<typeof ChipInput>;

// --- Stories ---

export const Default: Story = {
  args: {
    chips: ['chip1', 'chip2', 'chip3'],
    onChange: (chips) => {
      fn();
    },
  },
};
