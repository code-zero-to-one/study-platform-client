import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { BaseInput } from '@/shared/ui/input';

const meta = {
  title: 'UI/Input',
  component: BaseInput,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      description: 'Input 플레이스홀더 레이블',
      control: 'text',
    },
    onChange: {
      description: 'Input 값 변경 핸들러',
      control: false,
    },
    color: {
      description: 'Input validation 상태에 따른 색 변경',
      control: { type: 'select' },
    },
  },
} satisfies Meta<typeof BaseInput>;

export default meta;
type Story = StoryObj<typeof BaseInput>;

// --- Stories ---

export const Default: Story = {
  args: {
    placeholder: 'Search',
    onChange: () => {
      fn();
    },
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Error',
    color: 'error',
    onChange: () => {
      fn();
    },
  },
};

export const Success: Story = {
  args: {
    placeholder: 'Success',
    color: 'success',
    onChange: () => {
      fn();
    },
  },
};
