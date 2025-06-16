import { Meta, StoryObj } from '@storybook/react';
import { ChangeEvent } from 'react';
import { BaseInput } from '@/shared/ui/input';

const meta: Meta<typeof BaseInput.Provider> = {
  component: BaseInput.Provider,
};

export default meta;

type Story = StoryObj<typeof BaseInput.Provider>;

export const Default: Story = {
  args: {
    placeholder: 'Search',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      console.log('onChange', event.target.value);
    },
  },
};
