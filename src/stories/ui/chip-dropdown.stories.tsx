import { Meta, StoryObj } from '@storybook/react';
import ChipDropdown from '@/shared/ui/chip-dropdown';

const meta: Meta<typeof ChipDropdown> = {
  component: ChipDropdown,
  argTypes: {
    options: {
      control: {
        type: 'object',
        options: ['chip1', 'chip2', 'chip3'],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChipDropdown>;

export const Default: Story = {
  args: {
    defaultValueIds: ['1', '2', '3'],
    options: [
      { label: 'chip1', value: '1' },
      { label: 'chip2', value: '2' },
      { label: 'chip3', value: '3' },
      { label: 'chip4', value: '4' },
      { label: 'chip5', value: '5' },
      { label: 'chip6', value: '6' },
      { label: 'chip7', value: '7' },
      { label: 'chip8', value: '8' },
      { label: 'chip9', value: '9' },
      { label: 'chip10', value: '10' },
    ],
    onChange: (ids) => {
      console.log(ids);
    },
  },
};
