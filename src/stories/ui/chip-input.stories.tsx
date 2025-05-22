import { Meta, StoryObj } from '@storybook/react';
import ChipInput from '@/shared/ui/chip-input';

const meta: Meta<typeof ChipInput> = {
  component: ChipInput,
  argTypes: {
    chips: {
      control: {
        type: 'object',
        options: ['chip1', 'chip2', 'chip3'],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChipInput>;

export const Default: Story = {
  args: {
    chips: ['chip1', 'chip2', 'chip3'],
    onChange: (chips) => {
      console.log(chips);
    },
  },
};
