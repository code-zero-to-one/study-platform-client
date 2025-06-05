import { Meta, StoryObj } from '@storybook/react';
import { ChangeEvent } from 'react';
import Input from '@/shared/ui/input';

const meta: Meta<typeof Input> = {
  component: Input,
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Search',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      console.log('onChange', event.target.value);
    },
  },
};
