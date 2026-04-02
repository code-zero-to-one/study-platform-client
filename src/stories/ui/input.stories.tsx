import { Meta, StoryObj } from '@storybook/react';
import { ChangeEvent } from 'react';
import { BaseInput } from '@/components/common/ui/input';

const meta: Meta<typeof BaseInput> = {
  component: BaseInput,
};

export default meta;

type Story = StoryObj<typeof BaseInput>;

export const Default: Story = {
  args: {
    placeholder: 'Search',
    onChange: (event: ChangeEvent<HTMLInputElement>) => {},
  },
};
