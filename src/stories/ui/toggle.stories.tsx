import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle } from '@/shared/ui/toggle';

const meta: Meta<typeof Toggle.Provider> = {
  component: Toggle.Provider,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'gray'], // 기존 예시 기준 수정
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    color: 'primary',
    size: 'md',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Toggle.Provider>;

const ToggleWithState = (args: any) => {
  const [checked, setChecked] = useState(false);

  return (
    <Toggle.Provider {...args} checked={checked} onCheckedChange={setChecked} />
  );
};

export const Default: Story = {
  render: ToggleWithState,
  args: {},
};
