import { Meta, StoryObj } from '@storybook/react';
import SingleDropdown from '@/components/ui/dropdown/single';

const meta: Meta<typeof SingleDropdown> = {
  component: SingleDropdown,
  argTypes: {
    placeholder: {
      control: { type: 'text' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SingleDropdown>;

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
