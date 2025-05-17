import { Meta, StoryObj } from '@storybook/react';
import ChipInput from '@/shared/ui/chip-input';

const meta: Meta<typeof ChipInput> = {
  component: ChipInput,
};

export default meta;

type Story = StoryObj<typeof ChipInput>;

export const Default: Story = {
  args: {},
};
