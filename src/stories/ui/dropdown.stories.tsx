import { Meta, StoryObj } from '@storybook/react';
import Dropdown from '@/shared/ui/dropdown';

const meta: Meta<typeof Dropdown> = {
  component: Dropdown,
  argTypes: {
    placeholder: {
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

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
