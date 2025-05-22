import { Meta, StoryObj } from '@storybook/react';
import Input from '@/shared/ui/input';
import { ChangeEvent } from 'react';

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
