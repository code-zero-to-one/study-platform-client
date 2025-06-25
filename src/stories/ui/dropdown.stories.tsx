import { Meta, StoryObj } from '@storybook/nextjs-vite';
import SingleDropdown from '@/shared/ui/dropdown/single';

const meta = {
  title: 'UI/Dropdown Single',
  tags: ['autodocs'],
  component: SingleDropdown,
  argTypes: {
    placeholder: {
      description: 'Dropdown 상태 placeholder 레이블',
      control: { type: 'text' },
    },
    options: {
      description: 'Dropdown 옵션 아이템',
      control: {
        type: 'object',
      },
    },
    defaultValue: {
      description: 'Dropdown 기본 선택 값 (option.value)',
    },
    onChange: {
      description: 'Dropdown 선택 핸들러',
    },
  },
} satisfies Meta<typeof SingleDropdown>;

export default meta;
type Story = StoryObj<typeof SingleDropdown>;

// --- Stories ---

export const Default: Story = {
  args: {
    placeholder: '선택하세요',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

export const Selected: Story = {
  args: {
    placeholder: '선택하세요',
    defaultValue: 'option1',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};
