import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import Chip from '@/shared/ui/chip';

const meta = {
  title: 'UI/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    text: {
      description: 'Chip 레이블 콘텐츠',
    },
    isActive: {
      description: 'Chip 활성화 유무',
      control: { type: 'boolean' },
    },
    className: {
      control: false,
    },
    onClose: {
      description: 'Chip 컴포넌트 삭제 핸들러',
      control: false,
    },
  },
  decorators: [
    (Story) => {
      return (
        <div className="flex">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

// --- Stories ---

export const Default: Story = {
  args: {
    text: 'Chip 레이블',
    isActive: true,
  },
};

export const Deactivated: Story = {
  args: {
    text: 'Chip 레이블',
    isActive: false,
  },
};

export const Deletable: Story = {
  args: {
    text: 'Chip 레이블',
    isActive: true,
    onClose: fn(),
  },
};
